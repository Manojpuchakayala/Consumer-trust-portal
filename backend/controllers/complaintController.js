const Complaint = require("../models/Complaint");
const User = require("../models/User");

// Helper to generate readable Unique Tracking ID e.g. CT-2026-89412
const generateComplaintId = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `CT-${year}-${randomNum}`;
};

// Register / Create Complaint
const createComplaint = async (req, res) => {
  try {
    const { name, email, phone, category, subject, description } = req.body;

    if (!name || !email || !phone || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: "All required fields (name, email, phone, subject, description) must be filled",
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
    });

    return res.status(201).json({
      success: true,
      message: "Complaint registered successfully",
      complaintId: complaint.complaintId,
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

    return res.status(200).json({
      success: true,
      complaint,
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

    await complaint.save();

    return res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
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

module.exports = {
  createComplaint,
  trackComplaint,
  getMyComplaints,
  getAllComplaints,
  getAdminStats,
  updateComplaintStatus,
  deleteComplaint,
};
