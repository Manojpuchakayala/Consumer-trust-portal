const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin", "citizen", "officer"],
      default: "citizen",
    },
    authProvider: {
      type: String,
      enum: ["google", "email_otp", "otp", "local"],
      default: "email_otp",
    },
    googleId: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: "",
    },
    isEmailVerified: {
      type: Boolean,
      default: true,
    },
    isTwoFactorEnabled: {
      type: Boolean,
      default: true,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    otpCode: {
      type: String,
      default: null,
    },
    otpExpiresAt: {
      type: Date,
      default: null,
    },
    lastOtpUsed: {
      type: String,
      default: null,
    },
    lastOtpUsedAt: {
      type: Date,
      default: null,
    },
    otpHistory: [
      {
        otp: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
