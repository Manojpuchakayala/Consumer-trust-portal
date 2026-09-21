const express = require("express");
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

// Normalize stringified or buffer request bodies across all platforms and serverless proxies
app.use((req, res, next) => {
  if (typeof req.body === "string" && req.body.trim()) {
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {
      // Ignore non-JSON body string
    }
  } else if (Buffer.isBuffer(req.body)) {
    try {
      req.body = JSON.parse(req.body.toString("utf8"));
    } catch (e) {
      // Ignore non-JSON buffer
    }
  }
  next();
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded evidence statically with safe headers
app.use("/uploads", express.static(uploadsDir));

// Database connection with Serverless Connection Caching
let cachedDbPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return mongoose.connection;
  if (cachedDbPromise) return cachedDbPromise;
  
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      "mongodb+srv://manojj:manoj123@consumer-trust-db.rxdifnq.mongodb.net/consumer_trust?retryWrites=true&w=majority&appName=consumer-trust-db";
    
    cachedDbPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });

    await cachedDbPromise;
    console.log("MongoDB Connected Successfully");
    return mongoose.connection;
  } catch (error) {
    cachedDbPromise = null;
    console.warn("MongoDB Connection Warning:", error.message);
  }
};
connectDB();

// Ensure DB is ready for serverless requests
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState < 1) {
    await connectDB();
  }
  next();
});

// Routes
const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const webhookRoutes = require("./routes/webhookRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/webhooks", webhookRoutes);

// Health check endpoints for instant ping/warmup
const healthResponse = (req, res) => {
  res.status(200).json({
    status: "healthy",
    platform: "Consumer Trust Grievance Facilitation Platform",
    environment: process.env.NODE_ENV || "production",
    timestamp: new Date().toISOString(),
  });
};
app.get("/health", healthResponse);
app.get("/api/health", healthResponse);

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

if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Consumer Trust Server running securely on port ${PORT}`);
  });
}

module.exports = app;
