const express = require("express");
const router = express.Router();

const {
  sendVerificationCode,
  verifyVerificationCode,
  initiateOtpLogin,
  verifyOtpLogin,
  googleAuth,
  register,
  login,
  getMe,
} = require("../controllers/authController");

const { authRateLimiter, otpRateLimiter } = require("../middleware/rateLimiter");
const authMiddleware = require("../middleware/authMiddleware");

// Passwordless Email Verification Code Endpoints
router.post("/send-code", otpRateLimiter, sendVerificationCode);
router.post("/verify-code", verifyVerificationCode);
router.post("/initiate-otp", otpRateLimiter, initiateOtpLogin);
router.post("/verify-otp", verifyOtpLogin);
router.post("/resend-otp", otpRateLimiter, initiateOtpLogin);

// Google OAuth 2.0 / OpenID Connect Endpoint
router.post("/google", googleAuth);

// Fallback compatibility routes (directly dispatch verification code)
router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);

// Authenticated profile retrieval
router.get("/me", authMiddleware, getMe);

module.exports = router;
