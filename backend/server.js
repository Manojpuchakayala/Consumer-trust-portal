const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Middlewares
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like curl, mobile, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".netlify.app") ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy: Access restricted"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Static file hosting for uploaded complaint attachments
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Initialize Safe Database Connection
connectDB();

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/users", userRoutes);

// Root API Welcome & Status
app.get("/", (req, res) => {
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
  const dbState = dbStates[mongoose.connection.readyState] || "unknown";

  res.status(200).json({
    success: true,
    message: "Consumer Trust Portal API Server is running successfully 🚀",
    database: {
      status: dbState,
      name: mongoose.connection.name || "consumer_trust",
    },
    version: "1.2.0",
    frontendUrl: "http://localhost:5173",
    features: ["Two-Step Verification (2FA OTP)", "Google OAuth 2.0 Sign-In", "Live Complaint Redressal"],
    availableEndpoints: {
      health: "/api/health",
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        verifyOtp: "POST /api/auth/verify-otp",
        resendOtp: "POST /api/auth/resend-otp",
        googleAuth: "POST /api/auth/google",
      },
      complaints: {
        create: "POST /api/complaints",
        track: "GET /api/complaints/track/:complaintId",
        myComplaints: "GET /api/complaints/my",
        stats: "GET /api/complaints/stats (Admin)",
        all: "GET /api/complaints (Admin)",
        updateStatus: "PUT /api/complaints/:id/status (Admin)",
      },
      users: {
        me: "GET /api/users/me",
      },
    },
  });
});

// Health Check with Database Status
app.get("/api/health", (req, res) => {
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
  const dbState = dbStates[mongoose.connection.readyState] || "unknown";

  res.status(200).json({
    success: true,
    message: "Consumer Trust API is operational",
    database: {
      status: dbState,
      name: mongoose.connection.name || "consumer_trust",
    },
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Consumer Trust Server running at http://localhost:${PORT}`);
});
