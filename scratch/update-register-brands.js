const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

console.log("Updating RegisterComplaint.jsx ENTERPRISE_OPTIONS...");
const regPath = path.join(root, "frontend", "src", "pages", "RegisterComplaint.jsx");
let regContent = fs.readFileSync(regPath, "utf8");

const newEnterpriseOptions = `const ENTERPRISE_OPTIONS = [
  // E-Commerce & Retail
  { id: "amazon", name: "Amazon India", category: "Product", nodal: "grievance-officer@amazon.in", sla: "48h Ack / 7 Days Redressal" },
  { id: "flipkart", name: "Flipkart", category: "Product", nodal: "grievance.officer@flipkart.com", sla: "48h Ack / 7 Days Redressal" },
  { id: "myntra", name: "Myntra", category: "Product", nodal: "grievanceofficer@myntra.com", sla: "48h Ack / 7 Days Redressal" },
  { id: "meesho", name: "Meesho", category: "Product", nodal: "grievance-officer@meesho.com", sla: "48h Ack / 7 Days Redressal" },
  { id: "ajio", name: "Ajio (Reliance Retail)", category: "Product", nodal: "grievance.officer@ajio.com", sla: "48h Ack / 7 Days Redressal" },
  { id: "nykaa", name: "Nykaa", category: "Product", nodal: "grievanceofficer@nykaa.com", sla: "48h Ack / 7 Days Redressal" },
  { id: "tatacliq", name: "Tata CLiQ", category: "Product", nodal: "grievanceofficer@tatacliq.com", sla: "48h Ack / 7 Days Redressal" },

  // Food & Quick Commerce
  { id: "zomato", name: "Zomato", category: "Food", nodal: "grievance@zomato.com", sla: "24h Ack / 3 Days Redressal" },
  { id: "swiggy", name: "Swiggy", category: "Food", nodal: "grievances@swiggy.in", sla: "24h Ack / 3 Days Redressal" },
  { id: "blinkit", name: "Blinkit", category: "Food", nodal: "grievance@blinkit.com", sla: "24h Ack / 3 Days Redressal" },
  { id: "zepto", name: "Zepto", category: "Food", nodal: "grievance@zeptonow.com", sla: "24h Ack / 3 Days Redressal" },
  { id: "bigbasket", name: "BigBasket", category: "Food", nodal: "grievance@bigbasket.com", sla: "24h Ack / 3 Days Redressal" },
  { id: "dominos", name: "Domino's Pizza India", category: "Food", nodal: "guestcare@jublfood.com", sla: "24h Ack / 3 Days Redressal" },

  // Banking, UPI & Fintech
  { id: "sbi", name: "State Bank of India (SBI)", category: "Banking", nodal: "nodalofficer@sbi.co.in", sla: "48h Ack / 7 Days Redressal (RBI Mandate)" },
  { id: "hdfc", name: "HDFC Bank", category: "Banking", nodal: "grievance.redressal@hdfcbank.com", sla: "48h Ack / 7 Days Redressal (RBI Mandate)" },
  { id: "icici", name: "ICICI Bank", category: "Banking", nodal: "headservicequality@icicibank.com", sla: "48h Ack / 7 Days Redressal (RBI Mandate)" },
  { id: "axis", name: "Axis Bank", category: "Banking", nodal: "nodal.officer@axisbank.com", sla: "48h Ack / 7 Days Redressal (RBI Mandate)" },
  { id: "kotak", name: "Kotak Mahindra Bank", category: "Banking", nodal: "nodalofficer@kotak.com", sla: "48h Ack / 7 Days Redressal (RBI Mandate)" },
  { id: "pnb", name: "Punjab National Bank (PNB)", category: "Banking", nodal: "care@pnb.co.in", sla: "48h Ack / 7 Days Redressal (RBI Mandate)" },
  { id: "phonepe", name: "PhonePe (UPI & Payments)", category: "Banking", nodal: "grievance-officer@phonepe.com", sla: "24h Ack / 5 Days Redressal (NPCI)" },
  { id: "paytm", name: "Paytm Payments", category: "Banking", nodal: "grievanceofficer@paytm.com", sla: "24h Ack / 5 Days Redressal (NPCI)" },
  { id: "googlepay", name: "Google Pay India", category: "Banking", nodal: "gpay-grievance-india@google.com", sla: "24h Ack / 5 Days Redressal (NPCI)" },
  { id: "cred", name: "CRED", category: "Banking", nodal: "grievance@cred.club", sla: "24h Ack / 5 Days Redressal" },

  // Telecom & Utilities
  { id: "jio", name: "Reliance Jio Infocomm", category: "Telecom", nodal: "appellate.authority@jio.com", sla: "48h Ack / 7 Days Redressal (TRAI)" },
  { id: "airtel", name: "Bharti Airtel", category: "Telecom", nodal: "nodalofficer.india@airtel.com", sla: "48h Ack / 7 Days Redressal (TRAI)" },
  { id: "vi", name: "Vodafone Idea (Vi)", category: "Telecom", nodal: "nodalofficer@vodafoneidea.com", sla: "48h Ack / 7 Days Redressal (TRAI)" },
  { id: "bsnl", name: "BSNL India", category: "Telecom", nodal: "cmdbsnl@bsnl.co.in", sla: "48h Ack / 7 Days Redressal (TRAI)" },

  // Travel & Transport
  { id: "makemytrip", name: "MakeMyTrip", category: "Travel", nodal: "grievance.officer@makemytrip.com", sla: "24h Ack / 7 Days Redressal" },
  { id: "irctc", name: "IRCTC (Indian Railways)", category: "Travel", nodal: "customercare@irctc.co.in", sla: "24h Ack / 5 Days Redressal" },
  { id: "indigo", name: "IndiGo Airlines", category: "Travel", nodal: "nodalofficer@goindigo.in", sla: "24h Ack / 7 Days Redressal" },
  { id: "airindia", name: "Air India", category: "Travel", nodal: "nodalofficer@airindia.com", sla: "24h Ack / 7 Days Redressal" },
  { id: "uber", name: "Uber India", category: "Travel", nodal: "grievance-officer-india@uber.com", sla: "24h Ack / 5 Days Redressal" },
  { id: "ola", name: "Ola Cabs", category: "Travel", nodal: "grievanceofficer@olacabs.com", sla: "24h Ack / 5 Days Redressal" },
  { id: "rapido", name: "Rapido Bike Taxi", category: "Travel", nodal: "grievance@rapido.bike", sla: "24h Ack / 5 Days Redressal" },

  // Electronics & Appliances
  { id: "samsung", name: "Samsung Electronics India", category: "Product", nodal: "grievance.india@samsung.com", sla: "48h Ack / 7 Days Redressal" },
  { id: "apple", name: "Apple India", category: "Product", nodal: "india_grievance_officer@apple.com", sla: "48h Ack / 7 Days Redressal" },
  { id: "xiaomi", name: "Xiaomi / Redmi India", category: "Product", nodal: "grievance-officer@xiaomi.com", sla: "48h Ack / 7 Days Redressal" },
  { id: "oneplus", name: "OnePlus India", category: "Product", nodal: "grievance.officer@oneplus.com", sla: "48h Ack / 7 Days Redressal" },
  { id: "sony", name: "Sony India", category: "Product", nodal: "sonyindia.care@sony.com", sla: "48h Ack / 7 Days Redressal" },
  { id: "lg", name: "LG Electronics India", category: "Product", nodal: "serviceindia@lge.com", sla: "48h Ack / 7 Days Redressal" },

  // Other / Custom
  { id: "other", name: "Other / Custom Enterprise", category: "Other", nodal: "Custom Enterprise Desk", sla: "Strict 7 Days Redressal" },
];`;

const startIdx = regContent.indexOf("const ENTERPRISE_OPTIONS = [");
const endIdx = regContent.indexOf("];", startIdx) + 2;

if (startIdx !== -1 && endIdx !== -1) {
  regContent = regContent.substring(0, startIdx) + newEnterpriseOptions + regContent.substring(endIdx);
  fs.writeFileSync(regPath, regContent, "utf8");
  console.log("Updated ENTERPRISE_OPTIONS in RegisterComplaint.jsx successfully");
} else {
  console.warn("Could not find ENTERPRISE_OPTIONS block in RegisterComplaint.jsx");
}
