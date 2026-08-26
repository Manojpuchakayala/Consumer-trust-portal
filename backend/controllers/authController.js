const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOtpEmail } = require("../utils/emailService");

// Helper to generate Full JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      avatar: user.avatar || "",
    },
    process.env.JWT_SECRET || "mysecretkey123",
    { expiresIn: "7d" }
  );
};

// Helper to generate 6-digit OTP
const generate6DigitOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register User
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const userRole = role === "admin" ? "admin" : "user";
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : "",
      role: userRole,
      authProvider: "local",
      isTwoFactorEnabled: true,
    });

    // Generate 2FA OTP for initial verification
    const otp = generate6DigitOtp();
    user.otpCode = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save();

    await sendOtpEmail(user.email, otp, user.name);

    // Generate temporary 2FA token
    const tempToken = jwt.sign(
      { tempId: user._id, email: user.email },
      process.env.JWT_SECRET || "mysecretkey123",
      { expiresIn: "15m" }
    );

    return res.status(201).json({
      success: true,
      requires2FA: true,
      message: "Account created! Please verify the 6-digit security code sent to your email.",
      tempToken,
      email: user.email,
      devOtp: otp, // Provided for instant developer testing
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

// Login User (Step 1: Validate Credentials & Issue 2FA Challenge)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.authProvider === "google" && !user.password) {
      return res.status(400).json({
        success: false,
        message: "This account was created with Google. Please use 'Sign In with Google'.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Step 2: Generate Two-Step Verification OTP
    const otp = generate6DigitOtp();
    user.otpCode = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    await sendOtpEmail(user.email, otp, user.name);

    // Sign temporary token for step 2 verification
    const tempToken = jwt.sign(
      { tempId: user._id, email: user.email },
      process.env.JWT_SECRET || "mysecretkey123",
      { expiresIn: "15m" }
    );

    return res.status(200).json({
      success: true,
      requires2FA: true,
      message: "Please enter the 6-digit Two-Step Verification code.",
      tempToken,
      email: user.email,
      devOtp: otp, // For local testing convenience
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};

// Verify Two-Step Verification Code (Step 2)
const verifyOtp = async (req, res) => {
  try {
    const { tempToken, otp, email } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "Verification code is required",
      });
    }

    let userId = null;

    if (tempToken) {
      try {
        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET || "mysecretkey123");
        userId = decoded.tempId;
      } catch (err) {
        return res.status(401).json({
          success: false,
          message: "Verification session expired. Please log in again.",
        });
      }
    }

    const query = userId ? { _id: userId } : { email: email ? email.toLowerCase().trim() : "" };
    const user = await User.findOne(query);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User session not found. Please log in again.",
      });
    }

    // Check OTP Match and Expiry
    if (!user.otpCode || user.otpCode.trim() !== otp.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid 6-digit verification code. Please check and try again.",
      });
    }

    if (!user.otpExpiresAt || new Date() > new Date(user.otpExpiresAt)) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please click 'Resend Code'.",
      });
    }

    // Clear OTP upon successful verification
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save();

    // Generate Full Session JWT
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Two-Step Verification successful! Welcome to Consumer Trust.",
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
      message: error.message || "OTP verification failed",
    });
  }
};

// Resend Two-Step Verification OTP
const resendOtp = async (req, res) => {
  try {
    const { tempToken, email } = req.body;

    let userId = null;
    if (tempToken) {
      try {
        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET || "mysecretkey123");
        userId = decoded.tempId;
      } catch (err) {}
    }

    const query = userId ? { _id: userId } : { email: email ? email.toLowerCase().trim() : "" };
    const user = await User.findOne(query);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User session not found. Please log in again.",
      });
    }

    const otp = generate6DigitOtp();
    user.otpCode = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpEmail(user.email, otp, user.name);

    return res.status(200).json({
      success: true,
      message: "A new 6-digit verification code has been dispatched.",
      devOtp: otp,
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to resend verification code",
    });
  }
};

// Google OAuth Authentication
const googleAuth = async (req, res) => {
  try {
    const { credential, userInfo } = req.body;

    let email, name, picture, googleId;

    if (credential) {
      // Decode Google JWT Credential Token Payload
      const parts = credential.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
        email = payload.email;
        name = payload.name;
        picture = payload.picture;
        googleId = payload.sub;
      }
    }

    if (!email && userInfo) {
      email = userInfo.email;
      name = userInfo.name;
      picture = userInfo.picture;
      googleId = userInfo.id || userInfo.sub;
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google authentication payload did not contain a valid email address.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Create new user with Google details
      user = await User.create({
        name: name || "Google User",
        email: normalizedEmail,
        googleId: googleId || null,
        avatar: picture || "",
        authProvider: "google",
        role: "user",
        isTwoFactorEnabled: false, // Google accounts handle 2FA natively at Google level
      });
      console.log("✅ New User created via Google Sign-In:", user._id);
    } else {
      // Update Google ID & avatar if not set
      if (!user.googleId && googleId) user.googleId = googleId;
      if (!user.avatar && picture) user.avatar = picture;
      await user.save();
      console.log("✅ Existing User authenticated via Google Sign-In:", user._id);
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Google Sign-In Successful",
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
    console.error("Google Auth Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Google authentication failed",
    });
  }
};

module.exports = {
  register,
  login,
  verifyOtp,
  resendOtp,
  googleAuth,
};
