const Complaint = require("../models/Complaint");
const User = require("../models/User");
const {
  sendComplaintConfirmationEmail,
  sendComplaintStatusUpdateEmail,
} = require("../utils/emailService");
const {
  sendComplaintRegistrationSMS,
  sendComplaintStatusUpdateSMS,
} = require("../utils/smsService");
const {
  formatRegistrationWhatsAppMessage,
  formatUpdateWhatsAppMessage,
  buildWhatsAppUrl,
  logWhatsAppDispatch,
} = require("../utils/whatsappService");

// Helper to generate readable Unique Tracking ID e.g. CT-2026-89412
const generateComplaintId = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `CT-${year}-${randomNum}`;
};

// Register / Create Complaint
const createComplaint = async (req, res) => {
  try {
    const { name, email, phone, category, subject, description, smsAlertsEnabled, whatsappAlertsEnabled } = req.body;

    if (!name || !email || !phone || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: "All required fields (name, email, phone, subject, description) must be filled",
      });
    }

    // Process file attachments (via Multer or direct attachments payload)
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
    } else if (req.body.attachments && Array.isArray(req.body.attachments)) {
      req.body.attachments.forEach((att) => {
        if (att && att.url) attachments.push(att);
      });
    }

    // Generate unique ID ensuring no collision
    let complaintId = generateComplaintId();
    let existing = await Complaint.findOne({ complaintId });
    while (existing) {
      complaintId = generateComplaintId();
      existing = await Complaint.findOne({ complaintId });
    }

    const userId = req.user ? req.user._id : null;
    const smsEnabled = smsAlertsEnabled !== false && smsAlertsEnabled !== "false";
    const waEnabled = whatsappAlertsEnabled !== false && whatsappAlertsEnabled !== "false";

    // Build official rich WhatsApp message & direct wa.me link
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
      subject: subject.trim(),
      description: description.trim(),
      status: "Pending",
      user: userId,
      attachments,
      smsAlertsEnabled: smsEnabled,
      whatsappAlertsEnabled: waEnabled,
      whatsappLogs: [waLog],
    });

    // Asynchronously dispatch official confirmation receipt email
    sendComplaintConfirmationEmail(complaint).catch((err) => {
      console.warn("Async confirmation email error:", err.message);
    });

    // Asynchronously dispatch confirmation SMS
    if (smsEnabled) {
      sendComplaintRegistrationSMS(complaint).catch((err) => {
        console.warn("Async registration SMS error:", err.message);
      });
    }

    return res.status(201).json({
      success: true,
      message: "Complaint registered successfully",
      complaintId: complaint.complaintId,
      whatsAppUrl,
      whatsAppMessage: waMessage,
      complaint,
    });
  } catch (error) {
    console.error("Create Complaint Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to register complaint",
    });
  }
};

// Track Complaint by Tracking ID (Public)
const trackComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    if (!complaintId) {
      return res.status(400).json({
        success: false,
        message: "Complaint ID is required",
      });
    }

    const trimmedId = complaintId.trim().toUpperCase();

    // Query either by complaintId or MongoDB _id if formatted as ObjectId
    let complaint = await Complaint.findOne({
      $or: [
        { complaintId: trimmedId },
        { complaintId: complaintId.trim() },
      ],
    }).populate("user", "name email");

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: `No complaint found with ID "${complaintId}"`,
      });
    }

    const waMessage = formatUpdateWhatsAppMessage(complaint);
    const whatsAppUrl = buildWhatsAppUrl(complaint.phone, waMessage);

    return res.status(200).json({
      success: true,
      complaint,
      whatsAppUrl,
      whatsAppMessage: waMessage,
    });
  } catch (error) {
    console.error("Track Complaint Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to track complaint",
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

    // Category breakdown
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    // Citizen satisfaction feedback aggregation
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

    // WhatsApp dispatch log and wa.me link
    const waMessage = formatUpdateWhatsAppMessage(complaint);
    const whatsAppUrl = buildWhatsAppUrl(complaint.phone, waMessage);
    const waLog = logWhatsAppDispatch(complaint.phone, waMessage);

    if (!complaint.whatsappLogs) complaint.whatsappLogs = [];
    complaint.whatsappLogs.push(waLog);

    await complaint.save();

    // Asynchronously dispatch status update notification email to citizen
    sendComplaintStatusUpdateEmail(complaint).catch((err) => {
      console.warn("Async status update email error:", err.message);
    });

    // Asynchronously dispatch status update notification SMS to citizen
    if (complaint.smsAlertsEnabled !== false) {
      sendComplaintStatusUpdateSMS(complaint).catch((err) => {
        console.warn("Async status update SMS error:", err.message);
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

// Delete Complaint (Admin)
const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findByIdAndDelete(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

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

    // Citizen satisfaction feedback aggregation
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
  trackComplaint,
  getMyComplaints,
  getAllComplaints,
  getAdminStats,
  getPublicStats,
  updateComplaintStatus,
  deleteComplaint,
  submitFeedback,
};
