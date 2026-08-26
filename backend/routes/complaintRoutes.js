const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");

const {
  createComplaint,
  trackComplaint,
  getMyComplaints,
  getAllComplaints,
  getAdminStats,
  updateComplaintStatus,
  deleteComplaint,
} = require("../controllers/complaintController");

// Public / User Routes
router.post("/", optionalAuthMiddleware, createComplaint);
router.get("/track/:complaintId", trackComplaint);
router.get("/my", authMiddleware, getMyComplaints);

// Admin Routes
router.get("/stats", authMiddleware, adminMiddleware, getAdminStats);
router.get("/", authMiddleware, adminMiddleware, getAllComplaints);
router.put("/:id/status", authMiddleware, adminMiddleware, updateComplaintStatus);
router.delete("/:id", authMiddleware, adminMiddleware, deleteComplaint);

module.exports = router;
