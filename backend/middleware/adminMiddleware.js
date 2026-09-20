const AUTHORIZED_ADMIN_EMAILS = [
  "manojpuchakayala321@gmail.com",
  "admin@consumertrust.gov",
];

const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Please log in",
    });
  }

  const userEmail = (req.user.email || "").toLowerCase().trim();

  if (req.user.role !== "admin" || !AUTHORIZED_ADMIN_EMAILS.includes(userEmail)) {
    return res.status(403).json({
      success: false,
      message: "Access Denied: Administrative access is strictly restricted to the authorized administrator only.",
    });
  }

  next();
};

module.exports = adminMiddleware;
