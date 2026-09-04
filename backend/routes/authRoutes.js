const express = require("express");
const router = express.Router();

const {
  register,
  login,
  verifyOtp,
  resendOtp,
  googleAuth,
} = require("../controllers/authController");

const { authRateLimiter, otpRateLimiter } = require("../middleware/rateLimiter");

// Apply rate limiting to critical authentication entry points
router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", otpRateLimiter, resendOtp);
router.post("/google", googleAuth);

module.exports = router;
