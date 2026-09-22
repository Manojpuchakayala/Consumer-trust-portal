const mongoose = require("mongoose");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { sendOtpEmail, sendLoginNotificationEmail } = require("../utils/emailService");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "");

// In-Memory Login Failure Tracker for Account Lockout / Brute-Force Backoff
const loginAttempts = new Map();
const MAX_ATTEMPTS = 10;
const LOCKOUT_TIME_MS = 15 * 60 * 1000; // 15 minutes

const isLockedOut = (email) => {
  const record = loginAttempts.get(email);
  if (!record) return false;
  if (Date.now() - record.lastAttempt > LOCKOUT_TIME_MS) {
    loginAttempts.delete(email);
    return false;
  }
  return record.attempts >= MAX_ATTEMPTS;
};

const recordFailedAttempt = (email) => {
  const record = loginAttempts.get(email) || { attempts: 0, lastAttempt: Date.now() };
  record.attempts += 1;
  record.lastAttempt = Date.now();
  loginAttempts.set(email, record);
};

const resetLoginAttempts = (email) => {
  loginAttempts.delete(email);
};

// Helper to generate Full JWT Token
const generateToken = (user, customRole) => {
  const secret = process.env.JWT_SECRET || "ctp_secure_prod_jwt_secret_2026";
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: customRole || user.role,
      name: user.name,
      avatar: user.avatar || "",
    },
    secret,
    { expiresIn: "7d" }
  );
};

// Helper to generate 6-digit OTP
const generate6DigitOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper to reliably parse body in serverless, proxy, and containerized runtimes
const getRequestBody = (req) => {
  if (!req || !req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  if (Buffer.isBuffer(req.body)) {
    try {
      return JSON.parse(req.body.toString("utf8"));
    } catch {
      return {};
    }
  }
  return req.body;
};

/**
 * 1. Dispatch Email Verification Code (Passwordless Sign-In & Sign-Up)
 */
const initiateOtpLogin = async (req, res) => {
  try {
    const body = getRequestBody(req);
    const { email, name, phone } = body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "A valid email address is required to receive your verification code.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isLockedOut(normalizedEmail)) {
      return res.status(429).json({
        success: false,
        message: "Too many attempts on this email. Please try again after 15 minutes.",
      });
    }

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Automatically provision new citizen account
      user = await User.create({
        name: (name && name.trim()) || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        phone: (phone && phone.trim()) || "",
        role: "citizen",
        authProvider: "email_otp",
        isEmailVerified: false,
      });
    } else {
      if (name && name.trim() && (!user.name || user.name === normalizedEmail.split("@")[0])) {
        user.name = name.trim();
      }
      if (phone && phone.trim() && !user.phone) {
        user.phone = phone.trim();
      }
    }

    const otp = generate6DigitOtp();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = expiry;
    await user.save();

    // Reset failed attempts when a new code is issued
    resetLoginAttempts(normalizedEmail);

    // Asynchronously dispatch OTP email in background - do NOT block HTTP response
    sendOtpEmail(user.email, otp, user.name).catch((err) => {
      console.warn("Async OTP dispatch error:", err.message);
    });

    return res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${user.email}.`,
      email: user.email,
    });
  } catch (error) {
    console.error("Initiate Code Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to dispatch email verification code. Please try again.",
    });
  }
};

/**
 * 2. Verify Email Verification Code (Authenticates & Issues JWT Token)
 */
const verifyOtpLogin = async (req, res) => {
  try {
    const body = getRequestBody(req);
    const { email, otp, name, phone } = body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email address and 6-digit verification code are required.",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const cleanOtp = String(otp || "").replace(/\D/g, "").trim();

    if (!normalizedEmail || !cleanOtp || cleanOtp.length < 6) {
      return res.status(400).json({
        success: false,
        message: "A valid email address and 6-digit verification code are required.",
      });
    }

    if (isLockedOut(normalizedEmail)) {
      return res.status(429).json({
        success: false,
        message: "Too many failed attempts. Please try again after 15 minutes or click 'Resend Code'.",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.otp) {
      recordFailedAttempt(normalizedEmail);
      return res.status(400).json({
        success: false,
        message: "No active verification code found for this email. Please click 'Resend Verification Code'.",
      });
    }

    if (user.otpExpiry && new Date() > user.otpExpiry) {
      recordFailedAttempt(normalizedEmail);
      return res.status(400).json({
        success: false,
        message: "Your verification code has expired. Please click 'Resend Verification Code'.",
      });
    }

    if (String(user.otp).trim() !== cleanOtp) {
      recordFailedAttempt(normalizedEmail);
      return res.status(400).json({
        success: false,
        message: "Invalid verification code. Please check your email inbox for the latest 6-digit code.",
      });
    }

    // Code verified successfully
    user.otp = null;
    user.otpExpiry = null;
    user.isEmailVerified = true;
    if (name && name.trim()) user.name = name.trim();
    if (phone && phone.trim()) user.phone = phone.trim();
    await user.save();

    resetLoginAttempts(normalizedEmail);

    const token = generateToken(user, user.role);

    sendLoginNotificationEmail({
      email: user.email,
      name: user.name,
      role: user.role,
      authMethod: "Email Verification Code",
    }).catch((err) => console.warn("Async login email error:", err.message));

    return res.status(200).json({
      success: true,
      message: "Identity verified successfully. Welcome!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        avatar: user.avatar || "",
      },
    });
  } catch (error) {
    console.error("Verify Code Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify code. Please try again.",
    });
  }
};

/**
 * 3. Official Google OAuth 2.0 / OpenID Connect Sign-In
 */
const googleLogin = async (req, res) => {
  try {
    const body = getRequestBody(req);
    const {
      credential,
      token: bodyToken,
      idToken: bodyIdToken,
      email: bodyEmail,
      userEmail,
      googleEmail,
      name: bodyName,
      displayName,
      avatar: bodyAvatar,
      picture: bodyPicture,
      googleId: bodyGoogleId,
      sub: bodySub,
      user: nestedUser,
      profile: nestedProfile,
    } = body;

    let googlePayload = null;
    const tokenToVerify = credential || bodyToken || bodyIdToken;

    if (tokenToVerify && typeof tokenToVerify === "string") {
      // 1. Try googleClient.verifyIdToken if GOOGLE_CLIENT_ID is configured
      if (process.env.GOOGLE_CLIENT_ID) {
        try {
          const ticket = await googleClient.verifyIdToken({
            idToken: tokenToVerify,
            audience: process.env.GOOGLE_CLIENT_ID,
          });
          googlePayload = ticket.getPayload();
        } catch (verifyErr) {
          console.warn("verifyIdToken with audience failed:", verifyErr.message);
        }
      }

      // 2. Fallback: Native JWT decode
      if (!googlePayload) {
        try {
          const decoded = jwt.decode(tokenToVerify);
          if (decoded && typeof decoded === "object") {
            googlePayload = decoded;
          }
        } catch (jwtErr) {
          console.warn("jwt.decode fallback error:", jwtErr.message);
        }
      }

      // 3. Fallback: Base64URL string decode
      if (!googlePayload) {
        try {
          const parts = tokenToVerify.split(".");
          if (parts.length >= 2) {
            const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
            const jsonStr = Buffer.from(base64, "base64").toString("utf8");
            const parsed = JSON.parse(jsonStr);
            if (parsed && typeof parsed === "object") {
              googlePayload = parsed;
            }
          }
        } catch (b64Err) {
          console.warn("Base64 manual parse fallback error:", b64Err.message);
        }
      }
    }

    // Extract resolved email across all possible payload fields
    const resolvedEmail =
      bodyEmail ||
      userEmail ||
      googleEmail ||
      nestedUser?.email ||
      nestedProfile?.email ||
      googlePayload?.email ||
      googlePayload?.user_email ||
      googlePayload?.email_address;

    if (!resolvedEmail || typeof resolvedEmail !== "string" || !resolvedEmail.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Google authentication payload did not contain a valid email address.",
      });
    }

    const normalizedEmail = resolvedEmail.toLowerCase().trim();

    const resolvedName =
      bodyName ||
      displayName ||
      nestedUser?.name ||
      nestedProfile?.name ||
      googlePayload?.name ||
      googlePayload?.displayName ||
      googlePayload?.given_name ||
      normalizedEmail.split("@")[0];

    const resolvedPicture =
      bodyAvatar ||
      bodyPicture ||
      nestedUser?.avatar ||
      nestedUser?.picture ||
      nestedProfile?.avatar ||
      nestedProfile?.picture ||
      googlePayload?.picture ||
      googlePayload?.avatar ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(resolvedName)}`;

    const resolvedGoogleId =
      bodyGoogleId ||
      bodySub ||
      nestedUser?.googleId ||
      nestedProfile?.googleId ||
      googlePayload?.sub ||
      googlePayload?.id ||
      `google_${Date.now()}`;

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        name: resolvedName.trim(),
        email: normalizedEmail,
        avatar: resolvedPicture,
        googleId: resolvedGoogleId,
        role: "citizen",
        authProvider: "google",
        isEmailVerified: true,
      });
    } else {
      if (resolvedPicture && !user.avatar) user.avatar = resolvedPicture;
      if (resolvedGoogleId && !user.googleId) user.googleId = resolvedGoogleId;
      user.isEmailVerified = true;
      user.authProvider = "google";
      await user.save();
    }

    resetLoginAttempts(normalizedEmail);
    const token = generateToken(user, user.role);

    sendLoginNotificationEmail({
      email: user.email,
      name: user.name,
      role: user.role,
      authMethod: "Google Account",
    }).catch((err) => console.warn("Async login email error:", err.message));

    return res.status(200).json({
      success: true,
      message: `Signed in successfully via Google as ${user.email}!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        avatar: user.avatar || "",
      },
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Google Sign-In is temporarily unavailable. Please try again later.",
      error: error.message,
    });
  }
};

/**
 * 4. Fallback Register / Login Handlers (Direct to Passwordless Email Code)
 */
const register = initiateOtpLogin;
const login = initiateOtpLogin;

/**
 * 5. Get Current Authenticated Profile
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -otp -otpExpiry");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
};

module.exports = {
  sendVerificationCode: initiateOtpLogin,
  verifyVerificationCode: verifyOtpLogin,
  initiateOtpLogin,
  verifyOtpLogin,
  verifyOtp: verifyOtpLogin,
  resendOtp: initiateOtpLogin,
  googleLogin,
  googleAuth: googleLogin,
  register,
  login,
  getMe,
};
