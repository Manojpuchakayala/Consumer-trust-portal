const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { getMe, getAllUsers } = require("../controllers/userController");

router.get("/me", authMiddleware, getMe);
router.get("/", authMiddleware, adminMiddleware, getAllUsers);

module.exports = router;
