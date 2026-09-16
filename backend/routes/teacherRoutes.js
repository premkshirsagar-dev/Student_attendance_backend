// routes/teacherRoutes.js
// Teacher is VIEW-ONLY on students. Add/edit/delete student routes
// have been removed — that's Admin-only now (see adminRoutes.js).
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
} = require("../controllers/attendanceController");

router.use(protect, authorize("teacher"));

// Dashboard
router.get("/dashboard", getDashboardStats);

// Students — VIEW ONLY
router.get("/students", getStudents);
router.get("/students/:id", getStudentById);

// Attendance
router.get("/attendance/class-students", getClassForAttendance);
router.get("/attendance/rankings", getAttendanceRankings);
router.post("/attendance", submitAttendance);
router.put("/attendance/:id", updateAttendance);
router.get("/attendance", getAttendanceRecords);

module.exports = router;
