const express = require("express");
const router = express.Router();
const webhookController = require("../controllers/webhookController");

// Enterprise CRM Ingest & Settlement Webhooks
router.post("/enterprise/resolve", webhookController.resolveComplaintWebhook);
router.get("/enterprise/dockets", webhookController.getCompanyDocketsWebhook);

module.exports = router;
