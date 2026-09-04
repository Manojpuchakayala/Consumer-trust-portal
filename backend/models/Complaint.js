const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Product", "Service", "Food", "Banking", "Other"],
      default: "Product",
    },
    subject: {
      type: String,
      required: [true, "Complaint subject is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Complaint description is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Rejected"],
      default: "Pending",
      index: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    adminRemarks: {
      type: String,
      default: "",
      trim: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    attachments: [
      {
        originalName: { type: String, required: true },
        filename: { type: String, required: true },
        path: { type: String },
        url: { type: String, required: true },
        mimeType: { type: String },
        size: { type: Number },
      },
    ],
    feedback: {
      rating: { type: Number, min: 1, max: 5, default: null },
      comments: { type: String, default: "" },
      submittedAt: { type: Date, default: null },
    },
    smsAlertsEnabled: {
      type: Boolean,
      default: true,
    },
    whatsappAlertsEnabled: {
      type: Boolean,
      default: true,
    },
    whatsappLogs: [
      {
        message: { type: String },
        phone: { type: String },
        status: { type: String, default: "DELIVERED" },
        provider: { type: String, default: "WhatsApp Cloud Gateway" },
        sentAt: { type: Date, default: Date.now },
      },
    ],
    smsLogs: [
      {
        message: { type: String },
        phone: { type: String },
        status: { type: String, default: "DELIVERED" },
        provider: { type: String, default: "Telecom Gateway" },
        sentAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Complaint", complaintSchema);
