// routes/authRoutes.js
// NOTE: There is no "/teacher/register" route — Teacher accounts can only
// be created by an authenticated Admin via /api/admin/teachers.
const express = require("express");
const router = express.Router();
const {
  registerStudent,
  registerAdmin,
  loginStudent,
  loginTeacher,
  loginAdmin,
} = require("../controllers/authController");

router.post("/student/register", registerStudent);
router.post("/admin/register", registerAdmin);
router.post("/student/login", loginStudent);
router.post("/teacher/login", loginTeacher);
router.post("/admin/login", loginAdmin);

module.exports = router;
