const Complaint = require("../models/Complaint");

/**
 * Enterprise Webhook API Controller
 * Enables corporate grievance desks (Zendesk, Salesforce, Freshdesk, Zoho)
 * to ingest open dockets and push resolution statuses in real time.
 */

// POST /api/webhooks/enterprise/resolve
exports.resolveComplaintWebhook = async (req, res) => {
  try {
    const {
      complaintId,
      actionTaken,
      refundAmount,
      referenceNumber,
      resolutionNotes,
      officerName,
      resolutionToken,
    } = req.body;

    if (!complaintId) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: complaintId",
      });
    }

    let query = { complaintId };
    if (resolutionToken) {
      query.resolutionToken = resolutionToken;
    }

    const complaint = await Complaint.findOne(query);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: `Complaint docket #${complaintId} not found or token invalid`,
      });
    }

    // Update settlement details
    complaint.status = "Resolved";
    complaint.resolvedAt = new Date();
    complaint.companyResolution = {
      actionTaken: actionTaken || "Settled via Enterprise API Webhook",
      refundAmount: Number(refundAmount) || 0,
      referenceNumber: referenceNumber || `API-UTR-${Date.now()}`,
      resolutionNotes: resolutionNotes || "Resolved programmatically via Corporate Webhook Integration",
      resolvedBy: officerName || "Enterprise Support Webhook",
      resolvedAt: new Date(),
    };

    await complaint.save();

    return res.status(200).json({
      success: true,
      message: `Docket #${complaint.complaintId} has been successfully resolved via Enterprise API`,
      data: {
        complaintId: complaint.complaintId,
        status: complaint.status,
        companyName: complaint.companyName,
        resolvedAt: complaint.resolvedAt,
        settlement: complaint.companyResolution,
      },
    });
  } catch (error) {
    console.error("Enterprise Webhook Resolve Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal webhook processing error",
      error: error.message,
    });
  }
};

// GET /api/webhooks/enterprise/dockets?companyName=Amazon
exports.getCompanyDocketsWebhook = async (req, res) => {
  try {
    const { companyName, status } = req.query;

    if (!companyName) {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'companyName' is required",
      });
    }

    const query = {
      companyName: { $regex: new RegExp(companyName, "i") },
    };

    if (status) {
      query.status = status;
    }

    const dockets = await Complaint.find(query)
      .select("complaintId name email category orderOrTransactionId subject description status createdAt")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      count: dockets.length,
      data: dockets,
    });
  } catch (error) {
    console.error("Enterprise Webhook Dockets Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal webhook error retrieving dockets",
      error: error.message,
    });
  }
};
