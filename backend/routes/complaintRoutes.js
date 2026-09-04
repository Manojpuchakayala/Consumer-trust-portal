const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");
const upload = require("../config/multer");

const {
  createComplaint,
  trackComplaint,
  getMyComplaints,
  getAllComplaints,
  getAdminStats,
  getPublicStats,
  updateComplaintStatus,
  deleteComplaint,
  submitFeedback,
} = require("../controllers/complaintController");

// Public / User Routes
router.get("/public-stats", getPublicStats);
router.post("/", optionalAuthMiddleware, upload.array("evidence", 5), createComplaint);
router.get("/track/:complaintId", trackComplaint);
router.get("/my", authMiddleware, getMyComplaints);
router.put("/:id/feedback", optionalAuthMiddleware, submitFeedback);

// Admin Routes
router.get("/stats", authMiddleware, adminMiddleware, getAdminStats);
router.get("/", authMiddleware, adminMiddleware, getAllComplaints);
router.put("/:id/status", authMiddleware, adminMiddleware, updateComplaintStatus);
router.delete("/:id", authMiddleware, adminMiddleware, deleteComplaint);

module.exports = router;
