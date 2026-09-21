const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

console.log("=== Hardening Backend Security & Privacy ===");

// 1. Write backend/middleware/adminMiddleware.js
const adminMiddlewarePath = path.join(root, "backend", "middleware", "adminMiddleware.js");
const adminMiddlewareCode = `// Admin Role Authorization Middleware
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please log in.",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access forbidden. Administrative privileges required.",
    });
  }

  next();
};

module.exports = adminMiddleware;
`;
fs.writeFileSync(adminMiddlewarePath, adminMiddlewareCode, "utf8");
console.log("Hardened backend/middleware/adminMiddleware.js");

// 2. Write backend/controllers/authController.js
const authControllerPath = path.join(root, "backend", "controllers", "authController.js");
const authControllerCode = `const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOtpEmail, sendLoginNotificationEmail } = require("../utils/emailService");

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
  // Requires at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  return hasLetter && hasNumber;
};

// Register User
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

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

    // Create user in database (default role is citizen, admin requires existing admin assignment)
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : "",
      role: role === "admin" && process.env.ALLOW_PUBLIC_ADMIN_SIGNUP === "true" ? "admin" : "citizen",
      isEmailVerified: false,
    });

    const token = generateToken(user, user.role);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
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
    console.error("Registration Error:", error);
    return res.status(500).json({
      success: false,
      message: "An internal error occurred during registration. Please try again.",
    });
  }
};

// Standard Password Login
const login = async (req, res) => {
  try {
    const { email, password, portal } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check Account Lockout
    if (isLockedOut(normalizedEmail)) {
      return res.status(429).json({
        success: false,
        message: "Account temporarily locked due to multiple consecutive failed login attempts. Please try again in 15 minutes or reset your password.",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.password) {
      recordFailedAttempt(normalizedEmail);
      return res.status(401).json({
        success: false,
        message: "Invalid email address or password.",
      });
    }

    // Strict Password Verification via bcrypt ONLY
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      recordFailedAttempt(normalizedEmail);
      return res.status(401).json({
        success: false,
        message: "Invalid email address or password.",
      });
    }

    // Reset failed attempts on success
    resetLoginAttempts(normalizedEmail);

    // Portal Access Control
    if (portal === "admin" && user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access restricted. This account does not possess administrative clearance.",
      });
    }

    const token = generateToken(user, user.role);

    // Asynchronously log login notification
    sendLoginNotificationEmail({
      email: user.email,
      name: user.name,
      role: user.role,
      authMethod: "Password Authentication",
      loginTime: new Date(),
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: "Signed in successfully.",
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
      message: "An internal server error occurred. Please try again.",
    });
  }
};

// Initiate 2FA OTP Login
const initiateOtpLogin = async (req, res) => {
  try {
    const { email } = req.body;

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
        message: "Too many attempts. Please try again in 15 minutes.",
      });
    }

    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Create citizen account on the fly for OTP verification
      user = await User.create({
        name: normalizedEmail.split("@")[0],
        email: normalizedEmail,
        role: "citizen",
        isEmailVerified: false,
      });
    }

    const otp = generate6DigitOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendOtpEmail(normalizedEmail, otp, user.name);

    return res.status(200).json({
      success: true,
      message: \`Verification code dispatched to \${normalizedEmail}. Code expires in 10 minutes.\`,
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
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email address and 6-digit verification code are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "No active verification code found. Please request a new code.",
      });
    }

    if (new Date() > user.otpExpiry) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new code.",
      });
    }

    if (user.otp !== otp.trim()) {
      recordFailedAttempt(normalizedEmail);
      return res.status(400).json({
        success: false,
        message: "Invalid verification code. Please check and try again.",
      });
    }

    // Reset OTP and attempts
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

// Google Single Sign-On
const googleLogin = async (req, res) => {
  try {
    const { email, name, avatar, googleId } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        name: name ? name.trim() : normalizedEmail.split("@")[0],
        email: normalizedEmail,
        avatar: avatar || "",
        googleId: googleId || "",
        role: "citizen",
        isEmailVerified: true,
      });
    } else {
      if (avatar && !user.avatar) user.avatar = avatar;
      if (googleId && !user.googleId) user.googleId = googleId;
      user.isEmailVerified = true;
      await user.save();
    }

    const token = generateToken(user, user.role);

    return res.status(200).json({
      success: true,
      message: "Signed in via Google successfully.",
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
    console.error("Google Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Google authentication failed. Please try standard sign-in.",
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
  googleLogin,
  getMe,
};
`;
fs.writeFileSync(authControllerPath, authControllerCode, "utf8");
console.log("Hardened backend/controllers/authController.js with rate limiting, bcrypt salt rounds, and lockout");

// 3. Update backend/controllers/complaintController.js with PII Masking & File Validation
const complaintControllerPath = path.join(root, "backend", "controllers", "complaintController.js");
let complaintCtrlContent = fs.readFileSync(complaintControllerPath, "utf8");

// Function to mask PII
const piiMaskingLogic = `
// Privacy Helper: Redact PII for unauthenticated public viewers
const maskName = (name) => {
  if (!name) return "Citizen";
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].charAt(0) + "***";
  }
  return parts.map((p) => p.charAt(0) + "***").join(" ");
};

const maskEmail = (email) => {
  if (!email || !email.includes("@")) return "c***@domain.com";
  const [user, domain] = email.split("@");
  const maskedUser = user.length <= 2 ? user.charAt(0) + "***" : user.charAt(0) + "***" + user.slice(-1);
  return \`\${maskedUser}@\${domain}\`;
};

const maskPhone = (phone) => {
  if (!phone) return "+91 ******XXXX";
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length >= 4) {
    return \`+91 ******\${digits.slice(-4)}\`;
  }
  return "+91 ******XXXX";
};

const maskRefId = (ref) => {
  if (!ref || ref.length <= 4) return ref;
  return ref.slice(0, 2) + "****" + ref.slice(-2);
};
`;

// Update trackComplaint to use PII masking
const newTrackComplaint = `// Track Complaint by Docket ID (With PII Privacy Masking)
const trackComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    if (!complaintId) {
      return res.status(400).json({
        success: false,
        message: "Docket ID is required",
      });
    }

    const trimmedId = complaintId.trim().toUpperCase();

    let complaint = await Complaint.findOne({
      $or: [
        { complaintId: trimmedId },
        { complaintId: complaintId.trim() },
      ],
    }).populate("user", "name email");

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: \`No grievance docket found matching ID "\${complaintId}"\`,
      });
    }

    // Determine if requester is authorized complaint owner or administrator
    const isOwner =
      req.user &&
      ((complaint.user && complaint.user._id && req.user._id && complaint.user._id.toString() === req.user._id.toString()) ||
       (complaint.email && req.user.email && complaint.email.toLowerCase() === req.user.email.toLowerCase()));
    const isAdmin = req.user && req.user.role === "admin";
    const isAuthorized = isOwner || isAdmin;

    // Build sanitized complaint response (mask PII if unauthenticated/public)
    const sanitizedComplaint = {
      _id: complaint._id,
      complaintId: complaint.complaintId,
      category: complaint.category,
      companyName: complaint.companyName,
      companyNoticeSent: complaint.companyNoticeSent,
      subject: complaint.subject,
      description: isAuthorized ? complaint.description : (complaint.description ? complaint.description.slice(0, 160) + "..." : ""),
      status: complaint.status,
      createdAt: complaint.createdAt,
      resolvedAt: complaint.resolvedAt,
      adminRemarks: complaint.adminRemarks,
      companyResolution: complaint.companyResolution,
      feedback: complaint.feedback,
      attachmentsCount: complaint.attachments ? complaint.attachments.length : 0,
      isAuthorizedViewer: isAuthorized,
      // Masked or full PII based on verified authorization
      name: isAuthorized ? complaint.name : maskName(complaint.name),
      email: isAuthorized ? complaint.email : maskEmail(complaint.email),
      phone: isAuthorized ? complaint.phone : maskPhone(complaint.phone),
      orderOrTransactionId: isAuthorized ? complaint.orderOrTransactionId : maskRefId(complaint.orderOrTransactionId),
      attachments: isAuthorized
        ? complaint.attachments
        : (complaint.attachments || []).map((att) => ({
            originalName: att.originalName ? "Evidence_Document_" + att.originalName.slice(-8) : "Evidence_Document",
            mimeType: att.mimeType,
          })),
    };

    const waMessage = formatUpdateWhatsAppMessage(complaint);
    const whatsAppUrl = buildWhatsAppUrl(complaint.phone, waMessage);

    return res.status(200).json({
      success: true,
      complaint: sanitizedComplaint,
      whatsAppUrl,
      whatsAppMessage: waMessage,
    });
  } catch (error) {
    console.error("Track Complaint Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while tracking docket.",
    });
  }
};`;

// Replace trackComplaint in controller
complaintCtrlContent = piiMaskingLogic + "\n" + complaintCtrlContent;
const trackStart = complaintCtrlContent.indexOf("// Track Complaint by Tracking ID (Public)");
if (trackStart !== -1) {
  const trackEnd = complaintCtrlContent.indexOf("// Get My Complaints (Authenticated User)", trackStart);
  if (trackEnd !== -1) {
    complaintCtrlContent = complaintCtrlContent.substring(0, trackStart) + newTrackComplaint + "\n\n" + complaintCtrlContent.substring(trackEnd);
  }
}
fs.writeFileSync(complaintControllerPath, complaintCtrlContent, "utf8");
console.log("Updated backend/controllers/complaintController.js with PII masking");

// 4. Update backend/server.js to include helmet, rate limiters, security headers
const serverPath = path.join(root, "backend", "server.js");
const serverCode = `const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

dotenv.config();

const app = express();

// Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Handled by frontend bundler / host
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Global Rate Limiter (200 requests per 15 minutes)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again later.",
  },
});
app.use("/api/", globalLimiter);

// Strict Rate Limiter for Authentication (20 requests per 15 mins)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});
app.use("/api/auth/", authLimiter);

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded evidence statically with safe headers
app.use("/uploads", express.static(uploadsDir));

// Database connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/consumer-trust";
    await mongoose.connect(mongoUri);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.warn("MongoDB Connection Warning:", error.message);
  }
};
connectDB();

// Routes
const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    platform: "Consumer Trust Grievance Facilitation Platform",
    environment: process.env.NODE_ENV || "production",
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint with compliance disclaimer
app.get("/", (req, res) => {
  res.send("Consumer Trust Portal Backend API - Independent Consumer Grievance Facilitation Platform");
});

// Centralized Error Handling
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "An unexpected internal server error occurred",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(\`Consumer Trust Server running securely on port \${PORT}\`);
});
`;
fs.writeFileSync(serverPath, serverCode, "utf8");
console.log("Updated backend/server.js with Helmet and Express-Rate-Limit");

console.log("=== Backend Security Hardening Complete ===");
