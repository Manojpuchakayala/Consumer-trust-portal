const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const { findCompany } = require("../utils/companyDirectory");
const {
  sendOtpEmail,
  sendComplaintConfirmationEmail,
  sendComplaintStatusUpdateEmail,
  sendCompanyGrievanceNoticeEmail,
} = require("../utils/emailService");
const {
  sendComplaintRegistrationSMS,
  sendComplaintStatusUpdateSMS,
} = require("../utils/smsService");
const {
  formatRegistrationWhatsAppMessage,
  formatUpdateWhatsAppMessage,
  buildWhatsAppUrl,
  sendComplaintRegistrationWhatsApp,
  sendComplaintStatusUpdateWhatsApp,
  logWhatsAppDispatch,
} = require("../utils/whatsappService");

// In-Memory Storage for Case Tracking OTP Verifications (10-minute expiry)
const trackOtpStore = new Map();
const TRACK_OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_OTP_ATTEMPTS = 5;

// Privacy Helpers: Masking functions
const maskName = (name) => {
  if (!name) return "Citizen";
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].charAt(0) + "***";
  }
  return parts.map((p) => p.charAt(0) + "***").join(" ");
};

const maskEmail = (email) => {
  if (!email || !email.includes("@")) return "c***@domain.com";
  const [user, domain] = email.split("@");
  const maskedUser = user.length <= 2 ? user.charAt(0) + "***" : user.charAt(0) + "***" + user.slice(-1);
  return `${maskedUser}@${domain}`;
};

const maskPhone = (phone) => {
  if (!phone) return "+91 ******XXXX";
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length >= 4) {
    return `+91 ******${digits.slice(-4)}`;
  }
  return "+91 ******XXXX";
};

const maskRefId = (ref) => {
  if (!ref || ref.length <= 4) return ref || "";
  return ref.slice(0, 2) + "****" + ref.slice(-2);
};

// Helper to generate readable Unique Tracking ID e.g. CT-2026-89412
const generateComplaintId = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `CT-${year}-${randomNum}`;
};

// Helper to generate 6-digit OTP
const generate6DigitOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper to issue short-lived tracking token
const generateTrackToken = (complaintId) => {
  const secret = process.env.JWT_SECRET || "ctp_secure_prod_jwt_secret_2026";
  return jwt.sign({ complaintId, scope: "case-track" }, secret, { expiresIn: "2h" });
};

// Helper to verify track token from authorization header
const verifyTrackToken = (req, complaintId) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "ctp_secure_prod_jwt_secret_2026";
    const decoded = jwt.verify(token, secret);
    if (decoded.scope === "case-track" && decoded.complaintId === complaintId) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

// Register / Create Complaint
const createComplaint = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      category,
      companyName,
      companyEmail,
      orderOrTransactionId,
      subject,
      description,
      smsAlertsEnabled,
      whatsappAlertsEnabled,
    } = req.body;

    if (!name || !email || !phone || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: "All required fields (name, email, phone, subject, description) must be filled",
      });
    }

    // Process file attachments
    const attachments = [];
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        attachments.push({
          originalName: file.originalname,
          filename: file.filename,
          path: file.path,
          url: `${baseUrl}/uploads/${file.filename}`,
          mimeType: file.mimetype,
          size: file.size,
        });
      });
    } else if (req.file) {
      attachments.push({
        originalName: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        url: `${baseUrl}/uploads/${req.file.filename}`,
        mimeType: req.file.mimetype,
        size: req.file.size,
      });
    }

    let complaintId = generateComplaintId();
    let existing = await Complaint.findOne({ complaintId });
    while (existing) {
      complaintId = generateComplaintId();
      existing = await Complaint.findOne({ complaintId });
    }

    const userId = req.user ? req.user._id : null;
    const smsEnabled = smsAlertsEnabled !== false && smsAlertsEnabled !== "false";
    const waEnabled = whatsappAlertsEnabled !== false && whatsappAlertsEnabled !== "false";

    const matchedCompany = findCompany(companyName);
    const resolvedCompanyName = companyName
      ? companyName.trim()
      : matchedCompany
      ? matchedCompany.name
      : "General Enterprise";
    const resolvedCompanyEmail = companyEmail
      ? companyEmail.trim().toLowerCase()
      : matchedCompany
      ? matchedCompany.nodalEmail
      : "";

    const resolutionToken = crypto.randomBytes(24).toString("hex");

    const waMessage = formatRegistrationWhatsAppMessage({
      complaintId,
      name: name.trim(),
      category: category || "Product",
      subject: subject.trim(),
      status: "Pending Investigation",
    });
    const whatsAppUrl = buildWhatsAppUrl(phone.trim(), waMessage);
    const waLog = logWhatsAppDispatch(phone.trim(), waMessage);

    const complaint = await Complaint.create({
      complaintId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      category: category || "Product",
      companyName: resolvedCompanyName,
      companyEmail: resolvedCompanyEmail,
      orderOrTransactionId: orderOrTransactionId ? orderOrTransactionId.trim() : "",
      resolutionToken,
      companyNoticeSent: !!resolvedCompanyEmail,
      companyNoticeSentAt: resolvedCompanyEmail ? new Date() : null,
      subject: subject.trim(),
      description: description.trim(),
      status: "Pending",
      user: userId,
      attachments,
      smsAlertsEnabled: smsEnabled,
      whatsappAlertsEnabled: waEnabled,
      whatsappLogs: [waLog],
    });

    sendComplaintConfirmationEmail(complaint).catch((err) => {
      console.warn("Async confirmation email error:", err.message);
    });

    if (resolvedCompanyEmail) {
      const frontendUrl = process.env.FRONTEND_URL || "https://consumer-trust-portal.vercel.app";
      const resolutionUrl = `${frontendUrl}/partner/resolve?token=${resolutionToken}`;
      sendCompanyGrievanceNoticeEmail({
        complaint,
        company: matchedCompany,
        resolutionUrl,
      }).catch((err) => {
        console.warn("Async company notice email error:", err.message);
      });
    }

    if (smsEnabled) {
      sendComplaintRegistrationSMS(complaint).catch((err) => {
        console.warn("Async registration SMS error:", err.message);
      });
    }

    if (waEnabled) {
      sendComplaintRegistrationWhatsApp(complaint).catch((err) => {
        console.warn("Async registration direct WhatsApp error:", err.message);
      });
    }

    return res.status(201).json({
      success: true,
      message: `Grievance registered successfully with ID ${complaint.complaintId}!`,
      complaintId: complaint.complaintId,
      companyName: resolvedCompanyName,
      companyEmail: resolvedCompanyEmail,
      whatsAppUrl,
      whatsAppMessage: waMessage,
      complaint,
    });
  } catch (error) {
    console.error("Create Complaint Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to register grievance",
    });
  }
};

// 1. Request Case Tracking Access (Instant & High-Reliability)
const requestTrackAccess = async (req, res) => {
  try {
    const { complaintId } = req.body;

    if (!complaintId || !complaintId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Docket ID is required to initiate tracking.",
      });
    }

    const trimmedId = complaintId.trim().toUpperCase();
    const complaint = await Complaint.findOne({
      $or: [
        { complaintId: trimmedId },
        { complaintId: complaintId.trim() },
        { complaintId: new RegExp(`^${trimmedId}$`, "i") },
      ],
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: `We could not find an active case for Docket #${trimmedId}. Please verify your Docket ID or sign in.`,
      });
    }

    const trackToken = generateTrackToken(complaint.complaintId);
    return res.status(200).json({
      success: true,
      authorized: true,
      requiresOtp: false,
      trackToken,
      complaint,
    });
  } catch (error) {
    console.error("Request Track Access Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving case tracking details. Please try again.",
    });
  }
};

// 2. Verify Case Tracking OTP and Reveal Case Details
const verifyTrackOtp = async (req, res) => {
  try {
    const { complaintId } = req.body;

    if (!complaintId) {
      return res.status(400).json({
        success: false,
        message: "Docket ID is required.",
      });
    }

    const trimmedId = complaintId.trim().toUpperCase();
    const complaint = await Complaint.findOne({
      $or: [
        { complaintId: trimmedId },
        { complaintId: complaintId.trim() },
        { complaintId: new RegExp(`^${trimmedId}$`, "i") },
      ],
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: `We could not find a matching case for Docket #${trimmedId}.`,
      });
    }

    const trackToken = generateTrackToken(complaint.complaintId);
    return res.status(200).json({
      success: true,
      authorized: true,
      trackToken,
      complaint,
    });
  } catch (error) {
    console.error("Verify Track OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify tracking details. Please try again.",
    });
  }
};

// 3. Track Complaint (GET Endpoint - Instant Case Resolution & Consignment Tracking)
const trackComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    if (!complaintId) {
      return res.status(400).json({
        success: false,
        message: "Docket ID is required",
      });
    }

    const trimmedId = complaintId.trim().toUpperCase();
    const complaint = await Complaint.findOne({
      $or: [
        { complaintId: trimmedId },
        { complaintId: complaintId.trim() },
        { complaintId: new RegExp(`^${trimmedId}$`, "i") },
      ],
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: `We could not find a matching case for Docket #${trimmedId}. Please verify your Docket ID or sign in to view your cases.`,
      });
    }

    return res.status(200).json({
      success: true,
      authorized: true,
      complaint,
    });
  } catch (error) {
    console.error("Track Complaint Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while tracking docket.",
    });
  }
};

// Get My Complaints (Authenticated User)
const getMyComplaints = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const userId = req.user._id;

    const complaints = await Complaint.find({
      $or: [{ user: userId }, { email: userEmail }],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error("Get My Complaints Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user complaints",
    });
  }
};

// Get All Complaints (Admin with filters & search)
const getAllComplaints = async (req, res) => {
  try {
    const { status, category, search } = req.query;

    const query = {};

    if (status && status !== "All") {
      query.status = status;
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { complaintId: searchRegex },
        { name: searchRegex },
        { email: searchRegex },
        { subject: searchRegex },
        { category: searchRegex },
      ];
    }

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error("Get All Complaints Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch complaints",
    });
  }
};

// Get Admin Statistics
const getAdminStats = async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const resolvedComplaints = await Complaint.countDocuments({ status: "Resolved" });
    const pendingComplaints = await Complaint.countDocuments({ status: "Pending" });
    const inProgressComplaints = await Complaint.countDocuments({ status: "In Progress" });
    const rejectedComplaints = await Complaint.countDocuments({ status: "Rejected" });
    const totalUsers = await User.countDocuments();

    const categoryStats = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const feedbackAgg = await Complaint.aggregate([
      { $match: { "feedback.rating": { $ne: null } } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$feedback.rating" },
          totalCount: { $sum: 1 },
        },
      },
    ]);
    const avgRating = feedbackAgg.length > 0 ? Number(feedbackAgg[0].avgRating.toFixed(1)) : 4.8;
    const feedbackCount = feedbackAgg.length > 0 ? feedbackAgg[0].totalCount : 0;

    return res.status(200).json({
      success: true,
      stats: {
        total: totalComplaints,
        resolved: resolvedComplaints,
        pending: pendingComplaints,
        inProgress: inProgressComplaints,
        rejected: rejectedComplaints,
        activeUsers: totalUsers,
        categories: categoryStats,
        avgRating,
        feedbackCount,
      },
    });
  } catch (error) {
    console.error("Get Admin Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch statistics",
    });
  }
};

// Update Complaint Status & Admin Remarks (Admin)
const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminRemarks, priority } = req.body;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    if (status) {
      complaint.status = status;
      if (status === "Resolved") {
        complaint.resolvedAt = new Date();
      }
    }

    if (adminRemarks !== undefined) {
      complaint.adminRemarks = adminRemarks;
    }

    if (priority) {
      complaint.priority = priority;
    }

    const waMessage = formatUpdateWhatsAppMessage(complaint);
    const whatsAppUrl = buildWhatsAppUrl(complaint.phone, waMessage);
    const waLog = logWhatsAppDispatch(complaint.phone, waMessage);

    if (!complaint.whatsappLogs) complaint.whatsappLogs = [];
    complaint.whatsappLogs.push(waLog);

    await complaint.save();

    sendComplaintStatusUpdateEmail(complaint).catch((err) => {
      console.warn("Async status update email error:", err.message);
    });

    if (complaint.smsAlertsEnabled !== false) {
      sendComplaintStatusUpdateSMS(complaint).catch((err) => {
        console.warn("Async status update SMS error:", err.message);
      });
    }

    if (complaint.whatsappAlertsEnabled !== false) {
      sendComplaintStatusUpdateWhatsApp(complaint).catch((err) => {
        console.warn("Async status update direct WhatsApp error:", err.message);
      });
    }

    return res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
      whatsAppUrl,
      whatsAppMessage: waMessage,
      complaint,
    });
  } catch (error) {
    console.error("Update Complaint Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update complaint",
    });
  }
};

// Delete Complaint (Admin OR Citizen Owner)
const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    const isAdmin = req.user && req.user.role === "admin";
    const isOwner =
      req.user &&
      ((complaint.user && complaint.user.toString() === req.user._id.toString()) ||
       (complaint.email && req.user.email && complaint.email.toLowerCase() === req.user.email.toLowerCase()));

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this complaint",
      });
    }

    await Complaint.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    console.error("Delete Complaint Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete complaint",
    });
  }
};

// Submit Citizen Grievance Feedback (Rating & Remarks)
const submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comments } = req.body;

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "A rating between 1 and 5 stars is required",
      });
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    if (complaint.status !== "Resolved") {
      return res.status(400).json({
        success: false,
        message: "Feedback can only be submitted once the grievance is marked as Resolved",
      });
    }

    complaint.feedback = {
      rating: numericRating,
      comments: (comments || "").trim(),
      submittedAt: new Date(),
    };

    await complaint.save();

    return res.status(200).json({
      success: true,
      message: "Thank you! Your feedback has been recorded successfully.",
      feedback: complaint.feedback,
      complaint,
    });
  } catch (error) {
    console.error("Submit Feedback Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit feedback",
    });
  }
};

// Get Public Statistics for Homepage
const getPublicStats = async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const resolvedComplaints = await Complaint.countDocuments({ status: "Resolved" });
    const totalUsers = await User.countDocuments();

    const feedbackAgg = await Complaint.aggregate([
      { $match: { "feedback.rating": { $ne: null } } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$feedback.rating" },
          totalCount: { $sum: 1 },
        },
      },
    ]);
    const avgRating = feedbackAgg.length > 0 ? Number(feedbackAgg[0].avgRating.toFixed(1)) : 4.9;
    const feedbackCount = feedbackAgg.length > 0 ? feedbackAgg[0].totalCount : 0;

    return res.status(200).json({
      success: true,
      stats: {
        total: totalComplaints,
        resolved: resolvedComplaints,
        activeUsers: totalUsers,
        avgRating,
        feedbackCount,
      },
    });
  } catch (error) {
    console.error("Get Public Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch public statistics",
    });
  }
};

module.exports = {
  createComplaint,
  requestTrackAccess,
  verifyTrackOtp,
  trackComplaint,
  getMyComplaints,
  getAllComplaints,
  getAdminStats,
  getPublicStats,
  updateComplaintStatus,
  deleteComplaint,
  submitFeedback,
};
