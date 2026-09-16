// routes/adminRoutes.js
// Every route here requires a valid JWT AND role === "admin"
// Admin has: full Teacher CRUD, full Student CRUD, full Admin CRUD,
// AND the same attendance capabilities Teacher has.
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/adminController");

const {
  getClassForAttendance,
  submitAttendance,
  updateAttendance,
  getAttendanceRecords,
  getAttendanceRankings,
} = require("../controllers/attendanceController");

router.use(protect, authorize("admin"));

// Teacher management
router.get("/teachers", getTeachers);
router.get("/teachers/:id", getTeacherById);
router.post("/teachers", createTeacher);
router.put("/teachers/:id", updateTeacher);
router.delete("/teachers/:id", deleteTeacher);

// Admin management (other admins)
router.get("/admins", getAdmins);
router.get("/admins/:id", getAdminById);
router.post("/admins", createAdmin);
router.put("/admins/:id", updateAdmin);
router.delete("/admins/:id", deleteAdmin);

// Student management — full CRUD
router.get("/students", getStudents);
router.get("/students/:id", getStudentById);
router.post("/students", createStudent);
router.put("/students/:id", updateStudent);
router.delete("/students/:id", deleteStudent);

// Attendance — same capabilities as Teacher
router.get("/attendance/class-students", getClassForAttendance);
router.get("/attendance/rankings", getAttendanceRankings);
router.post("/attendance", submitAttendance);
router.put("/attendance/:id", updateAttendance);
router.get("/attendance", getAttendanceRecords);

module.exports = router;
