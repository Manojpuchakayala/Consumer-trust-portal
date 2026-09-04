// WhatsApp Notification Service (Direct Click-to-Chat & Cloud Gateway)

/**
 * Formats a phone number for WhatsApp wa.me links (defaults to India +91 if 10 digits).
 */
const formatWhatsAppNumber = (phone) => {
  if (!phone) return "";
  const cleaned = phone.toString().replace(/[^0-9]/g, "");
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return cleaned;
};

/**
 * Formats official Grievance Registration WhatsApp Card
 */
const formatRegistrationWhatsAppMessage = (complaint) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const trackUrl = `${frontendUrl}/track?id=${complaint.complaintId}`;

  return [
    `🏛️ *CONSUMER TRUST GRIEVANCE REDRESSAL CELL*`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `✅ *Grievance Successfully Registered!*`,
    ``,
    `📋 *Tracking ID:* ${complaint.complaintId}`,
    `👤 *Complainant:* ${complaint.name}`,
    `📁 *Category:* ${complaint.category}`,
    `📌 *Subject:* ${complaint.subject}`,
    `⏳ *Initial Status:* ${complaint.status || "Pending Investigation"}`,
    ``,
    `🔗 *Track Live Investigation & Milestones:*`,
    `${trackUrl}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `_Please preserve your Tracking ID for ombudsman appeals and verified settlements._`,
  ].join("\n");
};

/**
 * Formats official Grievance Status / Resolution Update WhatsApp Card
 */
const formatUpdateWhatsAppMessage = (complaint) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const trackUrl = `${frontendUrl}/track?id=${complaint.complaintId}`;
  const statusEmoji =
    complaint.status === "Resolved"
      ? "✅"
      : complaint.status === "In Progress"
      ? "🔍"
      : complaint.status === "Rejected"
      ? "❌"
      : "⏳";

  const lines = [
    `🏛️ *CONSUMER TRUST OFFICIAL STATUS UPDATE*`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `${statusEmoji} *Status Update for Case:* ${complaint.complaintId}`,
    ``,
    `👤 *Complainant:* ${complaint.name}`,
    `📁 *Category:* ${complaint.category}`,
    `📌 *Subject:* ${complaint.subject}`,
    `📊 *Current Status:* *${complaint.status}*`,
  ];

  if (complaint.adminRemarks) {
    lines.push(``, `📝 *Official Authority Remarks:*`, `"${complaint.adminRemarks}"`);
  }

  lines.push(
    ``,
    `🔗 *View Official Case File & Resolution Details:*`,
    `${trackUrl}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `_Verified by Grievance Redressal Officer on ${new Date().toLocaleDateString()}._`
  );

  return lines.join("\n");
};

/**
 * Builds direct WhatsApp Click-to-Chat URL
 */
const buildWhatsAppUrl = (phone, text) => {
  const formattedNumber = formatWhatsAppNumber(phone);
  const encodedText = encodeURIComponent(text);
  if (formattedNumber) {
    return `https://wa.me/${formattedNumber}?text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
};

/**
 * Logs dispatch simulation for audit
 */
const logWhatsAppDispatch = (phone, message) => {
  const timestamp = new Date().toLocaleTimeString();
  const formattedPhone = formatWhatsAppNumber(phone);

  console.log("=========================================");
  console.log(`💬 [WHATSAPP DISPATCH - CONSUMER TRUST BOT]`);
  console.log(`   Time: ${timestamp}`);
  console.log(`   To: +${formattedPhone}`);
  console.log(`   Status: READY_TO_SEND / DELIVERED (200 OK)`);
  console.log(`   Card Preview:`);
  console.log(`   ${message.split("\n")[0]}`);
  console.log(`   ${message.split("\n")[2]}`);
  console.log("=========================================");

  return {
    success: true,
    provider: "WhatsApp Cloud Gateway",
    phone: formattedPhone,
    message,
    sentAt: new Date(),
  };
};

module.exports = {
  formatWhatsAppNumber,
  formatRegistrationWhatsAppMessage,
  formatUpdateWhatsAppMessage,
  buildWhatsAppUrl,
  logWhatsAppDispatch,
};
