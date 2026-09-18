// routes/teacherRoutes.js
// Every route here requires a valid JWT AND role === "teacher"
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  getStudents,
  getStudentById,
  getDashboardStats,
} = require("../controllers/teacherController");

const {
  getClassForAttendance,
  submitAttendance,
  updateAttendance,
  getAttendanceRecords,
  getAttendanceRankings,
  getMidwayLeavers,
} = require("../controllers/attendanceController");

router.use(protect, authorize("teacher"));

// Dashboard
router.get("/dashboard", getDashboardStats);

// Student viewing ONLY — Teacher can no longer add/edit/delete students.
// Full Student CRUD now lives under /api/admin/students.
router.get("/students", getStudents);
router.get("/students/:id", getStudentById);

// Attendance
router.get("/attendance/class-students", getClassForAttendance);
router.get("/attendance/rankings", getAttendanceRankings);
router.get("/attendance/midway-leavers", getMidwayLeavers);
router.post("/attendance", submitAttendance);
router.put("/attendance/:id", updateAttendance);
router.get("/attendance", getAttendanceRecords);

module.exports = router;
