const jwt = require("jsonwebtoken");
const User = require("../models/User");

const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const secret = process.env.JWT_SECRET || "ctp_secure_prod_jwt_secret_2026";
      const decoded = jwt.verify(token, secret);
      const user = await User.findById(decoded.id).select("-password -otp -otpExpiry -otpHistory");
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // If token invalid, proceed as guest
  }
  next();
};

module.exports = optionalAuthMiddleware;
