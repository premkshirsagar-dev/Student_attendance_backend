// routes/authRoutes.js
// NOTE: There is no "/student/register" or "/teacher/register" route —
// Student and Teacher accounts can only be created by an authenticated
// Admin via /api/admin/students and /api/admin/teachers.
const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  loginStudent,
  loginTeacher,
  loginAdmin,
} = require("../controllers/authController");

router.post("/admin/register", registerAdmin);
router.post("/student/login", loginStudent);
router.post("/teacher/login", loginTeacher);
router.post("/admin/login", loginAdmin);

module.exports = router;
