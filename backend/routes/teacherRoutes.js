// routes/teacherRoutes.js
// Every route here requires a valid JWT AND role === "teacher"
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
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

// Student management (CRUD + search + filter via query params)
router.get("/students", getStudents);
router.get("/students/:id", getStudentById);
router.post("/students", createStudent);
router.put("/students/:id", updateStudent);
router.delete("/students/:id", deleteStudent);

// Attendance
router.get("/attendance/class-students", getClassForAttendance);
router.get("/attendance/rankings", getAttendanceRankings);
router.post("/attendance", submitAttendance);
router.put("/attendance/:id", updateAttendance);
router.get("/attendance", getAttendanceRecords);

module.exports = router;
