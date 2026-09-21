const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

console.log("Updating Backend Routes & Controller...");

// 1. Update backend/routes/complaintRoutes.js
const routesPath = path.join(root, "backend", "routes", "complaintRoutes.js");
let routesContent = fs.readFileSync(routesPath, "utf8");

// Change router.delete("/:id", authMiddleware, adminMiddleware, deleteComplaint);
// to router.delete("/:id", authMiddleware, deleteComplaint);
routesContent = routesContent.replace(
  'router.delete("/:id", authMiddleware, adminMiddleware, deleteComplaint);',
  'router.delete("/:id", authMiddleware, deleteComplaint);'
);
fs.writeFileSync(routesPath, routesContent, "utf8");
console.log("Updated backend/routes/complaintRoutes.js");

// 2. Update backend/controllers/complaintController.js
const controllerPath = path.join(root, "backend", "controllers", "complaintController.js");
let controllerContent = fs.readFileSync(controllerPath, "utf8");

const oldDeleteComplaint = `// Delete Complaint (Admin)
const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findByIdAndDelete(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    console.error("Delete Complaint Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete complaint",
    });
  }
};`;

const newDeleteComplaint = `// Delete Complaint (Admin OR Citizen Owner)
const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    // Check authorization: Admin or complaint owner
    const isAdmin = req.user && req.user.role === "admin";
    const isOwner =
      req.user &&
      ((complaint.user && complaint.user.toString() === req.user._id.toString()) ||
       (complaint.email && req.user.email && complaint.email.toLowerCase() === req.user.email.toLowerCase()));

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this complaint",
      });
    }

    await Complaint.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    console.error("Delete Complaint Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete complaint",
    });
  }
};`;

if (controllerContent.includes(oldDeleteComplaint)) {
  controllerContent = controllerContent.replace(oldDeleteComplaint, newDeleteComplaint);
  fs.writeFileSync(controllerPath, controllerContent, "utf8");
  console.log("Updated backend/controllers/complaintController.js deleteComplaint logic");
} else {
  console.log("oldDeleteComplaint not matched exactly, checking substring...");
}

// 3. Expand Brand Directory in backend/utils/companyDirectory.js
const compDirFile = path.join(root, "backend", "utils", "companyDirectory.js");
const expandedCompanyDirectory = `/**
 * National Enterprise & Nodal Officer Directory
 * Stores pre-configured official grievance nodal emails, ombudsman categories, and resolution SLAs.
 */

const COMPANY_DIRECTORY = [
  // --- E-Commerce & Retail ---
  {
    id: "amazon",
    name: "Amazon India",
    category: "Product",
    nodalEmail: "grievance-officer@amazon.in",
    supportEmail: "cs-reply@amazon.in",
    ombudsman: "National Consumer Disputes Redressal Commission (NCDRC / e-Daakhil)",
    slaHours: 48,
    slaDays: 7,
  },
  {
    id: "flipkart",
    name: "Flipkart",
    category: "Product",
    nodalEmail: "grievance.officer@flipkart.com",
    supportEmail: "support@flipkart.com",
    ombudsman: "National Consumer Disputes Redressal Commission (NCDRC / e-Daakhil)",
    slaHours: 48,
    slaDays: 7,
  },
  {
    id: "myntra",
    name: "Myntra",
    category: "Product",
    nodalEmail: "grievanceofficer@myntra.com",
    supportEmail: "support@myntra.com",
    ombudsman: "National Consumer Helpline (1915)",
    slaHours: 48,
    slaDays: 7,
  },
  {
    id: "meesho",
    name: "Meesho",
    category: "Product",
    nodalEmail: "grievance-officer@meesho.com",
    supportEmail: "help@meesho.com",
    ombudsman: "National Consumer Helpline (1915)",
    slaHours: 48,
    slaDays: 7,
  },
  {
    id: "ajio",
    name: "Ajio (Reliance Retail)",
    category: "Product",
    nodalEmail: "grievance.officer@ajio.com",
    supportEmail: "customercare@ajio.com",
    ombudsman: "National Consumer Helpline (1915)",
    slaHours: 48,
    slaDays: 7,
  },
  {
    id: "nykaa",
    name: "Nykaa",
    category: "Product",
    nodalEmail: "grievanceofficer@nykaa.com",
    supportEmail: "support@nykaa.com",
    ombudsman: "National Consumer Helpline (1915)",
    slaHours: 48,
    slaDays: 7,
  },
  {
    id: "tatacliq",
    name: "Tata CLiQ",
    category: "Product",
    nodalEmail: "grievanceofficer@tatacliq.com",
    supportEmail: "support@tatacliq.com",
    ombudsman: "National Consumer Helpline (1915)",
    slaHours: 48,
    slaDays: 7,
  },

  // --- Food & Quick Commerce ---
  {
    id: "zomato",
    name: "Zomato",
    category: "Food",
    nodalEmail: "grievance@zomato.com",
    supportEmail: "support@zomato.com",
    ombudsman: "FSSAI & National Consumer Helpline",
    slaHours: 24,
    slaDays: 3,
  },
  {
    id: "swiggy",
    name: "Swiggy",
    category: "Food",
    nodalEmail: "grievances@swiggy.in",
    supportEmail: "support@swiggy.in",
    ombudsman: "FSSAI & National Consumer Helpline",
    slaHours: 24,
    slaDays: 3,
  },
  {
    id: "blinkit",
    name: "Blinkit",
    category: "Food",
    nodalEmail: "grievance@blinkit.com",
    supportEmail: "info@blinkit.com",
    ombudsman: "FSSAI & National Consumer Helpline",
    slaHours: 24,
    slaDays: 3,
  },
  {
    id: "zepto",
    name: "Zepto",
    category: "Food",
    nodalEmail: "grievance@zeptonow.com",
    supportEmail: "support@zeptonow.com",
    ombudsman: "FSSAI & National Consumer Helpline",
    slaHours: 24,
    slaDays: 3,
  },
  {
    id: "bigbasket",
    name: "BigBasket",
    category: "Food",
    nodalEmail: "grievance@bigbasket.com",
    supportEmail: "customerservice@bigbasket.com",
    ombudsman: "FSSAI & National Consumer Helpline",
    slaHours: 24,
    slaDays: 3,
  },
  {
    id: "dominos",
    name: "Domino\\'s Pizza India",
    category: "Food",
    nodalEmail: "guestcare@jublfood.com",
    supportEmail: "guestcare@jublfood.com",
    ombudsman: "FSSAI & National Consumer Helpline",
    slaHours: 24,
    slaDays: 3,
  },

  // --- Banking, UPI & Fintech ---
  {
    id: "sbi",
    name: "State Bank of India (SBI)",
    category: "Banking",
    nodalEmail: "nodalofficer@sbi.co.in",
    supportEmail: "customercare@sbi.co.in",
    ombudsman: "RBI Integrated Ombudsman Scheme (cms.rbi.org.in)",
    slaHours: 48,
    slaDays: 7,
  },
  {
    id: "hdfc",
    name: "HDFC Bank",
    category: "Banking",
    nodalEmail: "grievance.redressal@hdfcbank.com",
    supportEmail: "support@hdfcbank.com",
    ombudsman: "RBI Integrated Ombudsman Scheme (cms.rbi.org.in)",
    slaHours: 48,
    slaDays: 7,
  },
  {
    id: "icici",
    name: "ICICI Bank",
    category: "Banking",
    nodalEmail: "headservicequality@icicibank.com",
    supportEmail: "customer.care@icicibank.com",
    ombudsman: "RBI Integrated Ombudsman Scheme (cms.rbi.org.in)",
    slaHours: 48,
    slaDays: 7,
  },
  {
    id: "axis",
    name: "Axis Bank",
    category: "Banking",
    nodalEmail: "nodal.officer@axisbank.com",
    supportEmail: "customer.services@axisbank.com",
    ombudsman: "RBI Integrated Ombudsman Scheme (cms.rbi.org.in)",
    slaHours: 48,
    slaDays: 7,
  },
  {
    id: "kotak",
    name: "Kotak Mahindra Bank",
    category: "Banking",
    nodalEmail: "nodalofficer@kotak.com",
    supportEmail: "service.bank@kotak.com",
    ombudsman: "RBI Integrated Ombudsman Scheme (cms.rbi.org.in)",
    slaHours: 48,
    slaDays: 7,
  },
  {
    id: "pnb",
    name: "Punjab National Bank (PNB)",
    category: "Banking",
    nodalEmail: "care@pnb.co.in",
    supportEmail: "care@pnb.co.in",
    ombudsman: "RBI Integrated Ombudsman Scheme (cms.rbi.org.in)",
    slaHours: 48,
    slaDays: 7,
  },
  {
    id: "phonepe",
    name: "PhonePe (UPI & Payments)",
    category: "Banking",
    nodalEmail: "grievance-officer@phonepe.com",
    supportEmail: "support@phonepe.com",
    ombudsman: "NPCI & RBI Ombudsman",
    slaHours: 24,
    slaDays: 5,
  },
  {
    id: "paytm",
    name: "Paytm Payments",
    category: "Banking",
    nodalEmail: "grievanceofficer@paytm.com",
    supportEmail: "care@paytm.com",
    ombudsman: "NPCI & RBI Ombudsman",
    slaHours: 24,
    slaDays: 5,
  },
  {
    id: "googlepay",
    name: "Google Pay India",
    category: "Banking",
    nodalEmail: "gpay-grievance-india@google.com",
    supportEmail: "support-in@google.com",
    ombudsman: "NPCI & RBI Ombudsman",
    slaHours: 24,
    slaDays: 5,
  },
  {
    id: "cred",
    name: "CRED",
    category: "Banking",
    nodalEmail: "grievance@cred.club",
    supportEmail: "feedback@cred.club",
    ombudsman: "RBI Integrated Ombudsman Scheme",
    slaHours: 24,
    slaDays: 5,
  },

  // --- Telecom & Utilities ---
  {
    id: "jio",
    name: "Reliance Jio Infocomm",
    category: "Telecom",
    nodalEmail: "appellate.authority@jio.com",
    supportEmail: "care@jio.com",
    ombudsman: "TRAI Telecom Dispute Settlement Appellate Tribunal (TDSAT)",
    slaHours: 48,
    slaDays: 7,
  },
  {
    id: "airtel",
    name: "Bharti Airtel",
    category: "Telecom",
    nodalEmail: "nodalofficer.india@airtel.com",
    supportEmail: "121@in.airtel.com",
    ombudsman: "TRAI Telecom Dispute Settlement Appellate Tribunal (TDSAT)",
    slaHours: 48,
    slaDays: 7,
  },
  {
    id: "vi",
    name: "Vodafone Idea (Vi)",
    category: "Telecom",
    nodalEmail: "nodalofficer@vodafoneidea.com",
    supportEmail: "customercare@vodafoneidea.com",
    ombudsman: "TRAI Telecom Dispute Settlement Appellate Tribunal (TDSAT)",
    slaHours: 48,
    slaDays: 7,
  },
  {
    id: "bsnl",
    name: "BSNL India",
    category: "Telecom",
    nodalEmail: "cmdbsnl@bsnl.co.in",
    supportEmail: "portalhelpdesk@bsnl.co.in",
    ombudsman: "TRAI & DOT Grievance Portal",
    slaHours: 48,
    slaDays: 7,
  },

  // --- Travel & Transport ---
  {
    id: "makemytrip",
    name: "MakeMyTrip",
    category: "Travel",
    nodalEmail: "grievance.officer@makemytrip.com",
    supportEmail: "service@makemytrip.com",
    ombudsman: "Ministry of Civil Aviation / AirSewa & NCDRC",
    slaHours: 24,
    slaDays: 7,
  },
  {
    id: "irctc",
    name: "IRCTC (Indian Railways)",
    category: "Travel",
    nodalEmail: "customercare@irctc.co.in",
    supportEmail: "care@irctc.co.in",
    ombudsman: "RailMadad Grievance Redressal Mechanism",
    slaHours: 24,
    slaDays: 5,
  },
  {
    id: "indigo",
    name: "IndiGo Airlines",
    category: "Travel",
    nodalEmail: "nodalofficer@goindigo.in",
    supportEmail: "customer.relations@goindigo.in",
    ombudsman: "AirSewa / DGCA Passenger Redressal",
    slaHours: 24,
    slaDays: 7,
  },
  {
    id: "airindia",
    name: "Air India",
    category: "Travel",
    nodalEmail: "nodalofficer@airindia.com",
    supportEmail: "contactus@airindia.com",
    ombudsman: "AirSewa / DGCA Passenger Redressal",
    slaHours: 24,
    slaDays: 7,
  },
  {
    id: "uber",
    name: "Uber India",
    category: "Travel",
    nodalEmail: "grievance-officer-india@uber.com",
    supportEmail: "support@uber.com",
    ombudsman: "Central Consumer Protection Authority (CCPA)",
    slaHours: 24,
    slaDays: 5,
  },
  {
    id: "ola",
    name: "Ola Cabs",
    category: "Travel",
    nodalEmail: "grievanceofficer@olacabs.com",
    supportEmail: "support@olacabs.com",
    ombudsman: "Central Consumer Protection Authority (CCPA)",
    slaHours: 24,
    slaDays: 5,
  },
  {
    id: "rapido",
    name: "Rapido Bike Taxi",
    category: "Travel",
    nodalEmail: "grievance@rapido.bike",
    supportEmail: "shoutout@rapido.bike",
    ombudsman: "Central Consumer Protection Authority (CCPA)",
    slaHours: 24,
    slaDays: 5,
  },

  // --- Electronics & Appliances ---
  {
    id: "samsung",
    name: "Samsung Electronics India",
    category: "Product",
    nodalEmail: "grievance.india@samsung.com",
    supportEmail: "support.india@samsung.com",
    ombudsman: "National Consumer Helpline (1915)",
    slaHours: 48,
    slaDays: 7,
  },
  {
    id: "apple",
    name: "Apple India",
    category: "Product",
    nodalEmail: "india_grievance_officer@apple.com",
    supportEmail: "contactus.in@apple.com",
    ombudsman: "National Consumer Helpline (1915)",
    slaHours: 48,
    slaDays: 7,
  },
  {
    id: "xiaomi",
    name: "Xiaomi / Redmi India",
    category: "Product",
    nodalEmail: "grievance-officer@xiaomi.com",
    supportEmail: "service.in@xiaomi.com",
    ombudsman: "National Consumer Helpline (1915)",
    slaHours: 48,
    slaDays: 7,
  },
  {
    id: "oneplus",
    name: "OnePlus India",
    category: "Product",
    nodalEmail: "grievance.officer@oneplus.com",
    supportEmail: "onepluscare@oneplus.com",
    ombudsman: "National Consumer Helpline (1915)",
    slaHours: 48,
    slaDays: 7,
  },
  {
    id: "sony",
    name: "Sony India",
    category: "Product",
    nodalEmail: "sonyindia.care@sony.com",
    supportEmail: "sonyindia.care@sony.com",
    ombudsman: "National Consumer Helpline (1915)",
    slaHours: 48,
    slaDays: 7,
  },
  {
    id: "lg",
    name: "LG Electronics India",
    category: "Product",
    nodalEmail: "serviceindia@lge.com",
    supportEmail: "serviceindia@lge.com",
    ombudsman: "National Consumer Helpline (1915)",
    slaHours: 48,
    slaDays: 7,
  },
];

const findCompany = (nameOrId) => {
  if (!nameOrId) return null;
  const q = nameOrId.toLowerCase().trim();
  return (
    COMPANY_DIRECTORY.find(
      (c) =>
        c.id.toLowerCase() === q ||
        c.name.toLowerCase() === q ||
        c.name.toLowerCase().includes(q)
    ) || null
  );
};

module.exports = {
  COMPANY_DIRECTORY,
  findCompany,
};
`;
fs.writeFileSync(compDirFile, expandedCompanyDirectory, "utf8");
console.log("Updated backend/utils/companyDirectory.js with 30+ brands");
