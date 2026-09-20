const express = require("express");
const router = express.Router();
const {
  getCompanyDirectory,
  getCaseByToken,
  resolveCaseByToken,
} = require("../controllers/companyController");

// Public / Company Nodal Desk routes (secured by token)
router.get("/directory", getCompanyDirectory);
router.get("/case/:token", getCaseByToken);
router.post("/resolve/:token", resolveCaseByToken);

module.exports = router;
