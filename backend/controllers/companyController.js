const crypto = require("crypto");
const Complaint = require("../models/Complaint");
const { COMPANY_DIRECTORY, findCompany } = require("../utils/companyDirectory");
const {
  sendConsumerCompanyResolutionEmail,
} = require("../utils/emailService");
const {
  formatUpdateWhatsAppMessage,
  buildWhatsAppUrl,
  logWhatsAppDispatch,
} = require("../utils/whatsappService");

// 1. Get List of Supported Enterprises & Banks
const getCompanyDirectory = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      count: COMPANY_DIRECTORY.length,
      companies: COMPANY_DIRECTORY,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch company directory",
    });
  }
};

// 2. Get Case Details by Secure Company Resolution Token
const getCaseByToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Resolution token is required",
      });
    }

    const complaint = await Complaint.findOne({ resolutionToken: token });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired resolution token. Please check the link sent to your grievance desk.",
      });
    }

    const companyInfo = findCompany(complaint.companyName);

    return res.status(200).json({
      success: true,
      complaint: {
        complaintId: complaint.complaintId,
        companyName: complaint.companyName,
        companyEmail: complaint.companyEmail,
        orderOrTransactionId: complaint.orderOrTransactionId,
        category: complaint.category,
        subject: complaint.subject,
        description: complaint.description,
        status: complaint.status,
        createdAt: complaint.createdAt,
        attachments: complaint.attachments,
        companyResolution: complaint.companyResolution,
        complainant: {
          name: complaint.name,
          email: complaint.email,
          phone: complaint.phone,
        },
      },
      companyInfo,
    });
  } catch (error) {
    console.error("Get Case by Token Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load grievance details",
    });
  }
};

// 3. Company Submits Official Resolution & Refund Proof
const resolveCaseByToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { actionTaken, refundAmount, referenceNumber, resolutionNotes, resolvedBy } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Resolution token is required",
      });
    }

    if (!actionTaken || !resolutionNotes) {
      return res.status(400).json({
        success: false,
        message: "Action taken and resolution notes are required",
      });
    }

    const complaint = await Complaint.findOne({ resolutionToken: token });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Grievance record not found or token expired",
      });
    }

    const resolutionData = {
      actionTaken: actionTaken.trim(),
      refundAmount: parseFloat(refundAmount) || 0,
      referenceNumber: referenceNumber ? referenceNumber.trim() : "",
      resolutionNotes: resolutionNotes.trim(),
      resolvedBy: resolvedBy ? resolvedBy.trim() : `${complaint.companyName} Nodal Officer`,
      resolvedAt: new Date(),
    };

    complaint.status = "Resolved";
    complaint.resolvedAt = new Date();
    complaint.companyResolution = resolutionData;
    complaint.adminRemarks = `[Resolved by ${complaint.companyName}] Action: ${actionTaken}. Ref: ${referenceNumber || "N/A"}. Note: ${resolutionNotes}`;

    await complaint.save();

    // 1. Dispatch Email to consumer
    sendConsumerCompanyResolutionEmail({
      complaint,
      companyResolution: resolutionData,
    }).catch((err) => console.warn("Async consumer resolution mail error:", err.message));

    // 2. Dispatch WhatsApp Update to consumer
    const waMessage = formatUpdateWhatsAppMessage(complaint);
    const waLog = logWhatsAppDispatch(complaint.phone, waMessage);

    return res.status(200).json({
      success: true,
      message: `Resolution successfully registered for Case #${complaint.complaintId}! Complainant has been notified via WhatsApp and Email.`,
      complaint,
    });
  } catch (error) {
    console.error("Resolve Case Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit enterprise resolution",
    });
  }
};

module.exports = {
  getCompanyDirectory,
  getCaseByToken,
  resolveCaseByToken,
};
