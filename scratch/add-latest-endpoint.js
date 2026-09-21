const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

// 1. Update backend/controllers/complaintController.js to export getLatestComplaint
const controllerPath = path.join(root, "backend", "controllers", "complaintController.js");
let controllerContent = fs.readFileSync(controllerPath, "utf8");

const getLatestCode = `// Get Latest Complaint for Instant Live Tracking
const getLatestComplaint = async (req, res) => {
  try {
    let complaint = await Complaint.findOne().sort({ createdAt: -1 });
    if (!complaint) {
      // If no complaint exists in database, create or return demo
      return res.status(404).json({
        success: false,
        message: "No complaints found",
      });
    }
    return res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch latest complaint",
    });
  }
};
`;

if (!controllerContent.includes("getLatestComplaint")) {
  controllerContent = controllerContent.replace(
    "module.exports = {",
    getLatestCode + "\nmodule.exports = {\n  getLatestComplaint,"
  );
  fs.writeFileSync(controllerPath, controllerContent, "utf8");
  console.log("Added getLatestComplaint to backend/controllers/complaintController.js");
}

// 2. Update backend/routes/complaintRoutes.js
const routesPath = path.join(root, "backend", "routes", "complaintRoutes.js");
let routesContent = fs.readFileSync(routesPath, "utf8");

if (!routesContent.includes("getLatestComplaint")) {
  routesContent = routesContent.replace(
    "  trackComplaint,",
    "  trackComplaint,\n  getLatestComplaint,"
  );
  routesContent = routesContent.replace(
    'router.get("/track/:complaintId", trackComplaint);',
    'router.get("/latest", getLatestComplaint);\nrouter.get("/track/:complaintId", trackComplaint);'
  );
  fs.writeFileSync(routesPath, routesContent, "utf8");
  console.log("Added router.get('/latest', getLatestComplaint) to backend/routes/complaintRoutes.js");
}
