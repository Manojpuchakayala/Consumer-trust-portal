// Scratch test for WhatsApp and Notification services
const { formatComplaintForWhatsApp, getWhatsAppShareUrl, getPlatformWhatsAppShareUrl } = require("../frontend/src/utils/whatsappShare.js");

// Mock complaint
const mockComplaint = {
  complaintId: "CTP-2026-003",
  companyName: "Amazon India",
  category: "Product",
  status: "Resolved",
  subject: "Defective Electronics & Delayed Refund",
  orderOrTransactionId: "OD4092819231",
};

const waText = formatComplaintForWhatsApp(mockComplaint);
console.log("--- WhatsApp Formatted Text ---");
console.log(waText);

const waUrl = getWhatsAppShareUrl(mockComplaint);
console.log("\n--- WhatsApp Share URL ---");
console.log(waUrl);

if (waUrl.includes("CTP-2026-003") && waUrl.includes("Amazon%20India") && waUrl.includes("Resolved")) {
  console.log("\n>>> WhatsApp URL Generation: PASSED");
} else {
  console.error("\n>>> WhatsApp URL Generation: FAILED");
  process.exit(1);
}
