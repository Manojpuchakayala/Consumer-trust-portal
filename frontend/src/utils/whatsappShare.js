/**
 * WhatsApp Sharing Utilities for Consumer Trust Portal
 * Generates formatted dispute data and live tracking URLs for 1-click WhatsApp sharing.
 */

export const formatComplaintForWhatsApp = (complaint) => {
  if (!complaint) return "";

  const docketId = complaint.complaintId || "N/A";
  const enterprise = complaint.companyName || "Disputed Enterprise";
  const category = complaint.category || "General Dispute";
  const status = complaint.status || "Pending";
  const subject = complaint.subject || "Consumer Grievance";
  const refId = complaint.orderOrTransactionId ? `\n*Reference/Order #:* ${complaint.orderOrTransactionId}` : "";
  
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://consumer-trust-portal.vercel.app";
  const trackUrl = `${baseUrl}/track?id=${encodeURIComponent(docketId)}`;

  let statusEmoji = "⏳";
  if (status === "Resolved") statusEmoji = "✅";
  else if (status === "In Progress") statusEmoji = "🔍";
  else if (status === "Rejected") statusEmoji = "❌";

  return `🛡️ *Consumer Trust — Grievance Docket Record*
━━━━━━━━━━━━━━━━━━━━
*Docket ID:* #${docketId}
*Enterprise:* ${enterprise}
*Category:* ${category}
*Status:* ${statusEmoji} ${status}${refId}
*Subject:* ${subject}
━━━━━━━━━━━━━━━━━━━━
🔗 *Verify & Track Live Progress:*
${trackUrl}

_Consumer Trust is an independent dispute facilitation platform._`;
};

/**
 * Returns a direct WhatsApp share URL with pre-filled message text.
 */
export const getWhatsAppShareUrl = (complaint) => {
  const message = formatComplaintForWhatsApp(complaint);
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
};

/**
 * Platform awareness share message
 */
export const getPlatformWhatsAppShareUrl = () => {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://consumer-trust-portal.vercel.app";
  const msg = `🛡️ *Consumer Trust Portal — Independent Consumer Dispute Facilitation*

Need help resolving a dispute with an e-commerce, banking, food delivery, or telecom brand in India?

Prepare structured grievance dockets, notify corporate grievance officers, and track voluntary resolutions securely:
👉 ${baseUrl}`;

  return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
};
