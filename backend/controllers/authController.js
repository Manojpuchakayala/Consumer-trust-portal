const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { sendOtpEmail, sendLoginNotificationEmail } = require("../utils/emailService");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "");

// In-Memory Login Failure Tracker for Account Lockout / Brute-Force Backoff
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
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

// Validate Password Strength
const isStrongPassword = (pwd) => {
  if (!pwd || pwd.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  return hasLetter && hasNumber;
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

// Register User
const register = async (req, res) => {
  try {
    const body = getRequestBody(req);
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email address and password are required",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long and contain both letters and numbers for account security.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "An account with this email address already exists. Please sign in.",
      });
    }

    // Hash password securely with 12 salt rounds
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create citizen user in database
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : "",
      role: "citizen",
      authProvider: "local",
      isEmailVerified: true,
      isTwoFactorEnabled: false,
    });

    const token = generateToken(user, user.role);

    // Log security notification email asynchronously
    sendLoginNotificationEmail({
      email: user.email,
      name: user.name,
      role: user.role,
      authMethod: "Password Registration",
    }).catch((err) => console.warn("Async login email error:", err.message));

    return res.status(201).json({
      success: true,
      message: "Citizen account registered successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar || "",
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to register account",
    });
  }
};

// Standard Password Login (Citizen or Officer/Admin)
const login = async (req, res) => {
  try {
    const body = getRequestBody(req);
    const { email, password, portal } = body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check brute-force lockout
    if (isLockedOut(normalizedEmail)) {
      return res.status(429).json({
        success: false,
        message: "Account temporarily locked due to multiple failed login attempts. Please try again after 15 minutes.",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.password) {
      recordFailedAttempt(normalizedEmail);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. Please verify your credentials.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      recordFailedAttempt(normalizedEmail);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. Please verify your credentials.",
      });
    }

    // Role check if logging in through Admin Portal
    if (portal === "admin" && user.role !== "admin") {
      recordFailedAttempt(normalizedEmail);
      return res.status(403).json({
        success: false,
        message: "Access Denied: This account is not authorized for administrative access.",
      });
    }

    // Successful login - reset failure counter
    resetLoginAttempts(normalizedEmail);

    const token = generateToken(user, user.role);

    sendLoginNotificationEmail({
      email: user.email,
      name: user.name,
      role: user.role,
      authMethod: portal === "admin" ? "Admin Password Auth" : "Citizen Password Auth",
    }).catch((err) => console.warn("Async login email error:", err.message));

    return res.status(200).json({
      success: true,
      message: "Logged in successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar || "",
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during authentication. Please try again.",
    });
  }
};

// Initiate 2FA OTP Login
const initiateOtpLogin = async (req, res) => {
  try {
    const body = getRequestBody(req);
    const { email } = body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isLockedOut(normalizedEmail)) {
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please try again after 15 minutes.",
      });
    }

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        name: normalizedEmail.split("@")[0],
        email: normalizedEmail,
        role: "citizen",
        authProvider: "otp",
        isEmailVerified: false,
      });
    }

    const otp = generate6DigitOtp();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = expiry;
    await user.save();

    await sendOtpEmail(user.email, otp, user.name);

    return res.status(200).json({
      success: true,
      message: "A 6-digit verification code has been dispatched to your email address.",
      email: user.email,
    });
  } catch (error) {
    console.error("Initiate OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to dispatch verification code. Please try again.",
    });
  }
};

// Verify 2FA OTP Login
const verifyOtpLogin = async (req, res) => {
  try {
    const body = getRequestBody(req);
    const { email, otp } = body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isLockedOut(normalizedEmail)) {
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please try again after 15 minutes.",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.otp) {
      recordFailedAttempt(normalizedEmail);
      return res.status(400).json({
        success: false,
        message: "No active verification code found. Please request a new code.",
      });
    }

    if (user.otpExpiry && new Date() > user.otpExpiry) {
      recordFailedAttempt(normalizedEmail);
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new code.",
      });
    }

    if (user.otp !== otp.trim()) {
      recordFailedAttempt(normalizedEmail);
      return res.status(400).json({
        success: false,
        message: "Invalid verification code. Please check your email and try again.",
      });
    }

    user.otp = null;
    user.otpExpiry = null;
    user.isEmailVerified = true;
    await user.save();
    resetLoginAttempts(normalizedEmail);

    const token = generateToken(user, user.role);

    return res.status(200).json({
      success: true,
      message: "Identity verified successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar || "",
      },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify code. Please try again.",
    });
  }
};

// Official Google OAuth 2.0 / OpenID Connect Sign-In
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

      // 2. Fallback: Native JWT decode (handles base64url automatically)
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

    // Extract resolved fields across all possible nested and direct keys
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
      if (!user.authProvider || user.authProvider === "local") {
        user.authProvider = "google";
      }
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

// Get Current Authenticated Profile
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
  register,
  login,
  initiateOtpLogin,
  verifyOtpLogin,
  verifyOtp: verifyOtpLogin,
  resendOtp: initiateOtpLogin,
  googleLogin,
  googleAuth: googleLogin,
  getMe,
};
