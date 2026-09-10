// routes/studentRoutes.js
// Every route here requires a valid JWT AND role === "student"
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { getProfile, getMyAttendance } = require("../controllers/studentController");

router.use(protect, authorize("student"));

router.get("/profile", getProfile);
router.get("/attendance", getMyAttendance);

module.exports = router;
