// In-Memory Rate Limiter for Authentication & OTP Protection
const rateLimits = new Map();

/**
 * Creates a rate limiting middleware
 * @param {number} maxRequests - Max requests permitted in the window
 * @param {number} windowMs - Window duration in milliseconds (e.g. 10 * 60 * 1000 = 10 mins)
 */
const createRateLimiter = ({ maxRequests = 10, windowMs = 10 * 60 * 1000 }) => {
  return (req, res, next) => {
    const ip =
      req.headers["x-forwarded-for"] ||
      req.connection?.remoteAddress ||
      req.ip ||
      "unknown-ip";

    // Exclude localhost from rate limiting to prevent developer testing delays
    if (
      ip === "127.0.0.1" ||
      ip === "::1" ||
      ip.includes("127.0.0.1") ||
      ip === "::ffff:127.0.0.1"
    ) {
      return next();
    }

    const now = Date.now();
    const clientRecord = rateLimits.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > clientRecord.resetTime) {
      clientRecord.count = 1;
      clientRecord.resetTime = now + windowMs;
    } else {
      clientRecord.count += 1;
    }

    rateLimits.set(ip, clientRecord);

    if (clientRecord.count > maxRequests) {
      const waitSeconds = Math.ceil((clientRecord.resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        message: `Too many authentication requests. Please wait ${waitSeconds} seconds before trying again.`,
        retryAfter: waitSeconds,
      });
    }

    next();
  };
};

// Cleanup routine every 15 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimits.entries()) {
    if (now > record.resetTime) {
      rateLimits.delete(ip);
    }
  }
}, 15 * 60 * 1000);

module.exports = {
  createRateLimiter,
  authRateLimiter: createRateLimiter({ maxRequests: 15, windowMs: 10 * 60 * 1000 }), // 15 requests per 10 mins
  otpRateLimiter: createRateLimiter({ maxRequests: 5, windowMs: 5 * 60 * 1000 }),   // 5 OTP resends per 5 mins
};
