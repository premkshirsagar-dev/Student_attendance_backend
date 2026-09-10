// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const {
  registerStudent,
  registerTeacher,
  loginStudent,
  loginTeacher,
} = require("../controllers/authController");

router.post("/student/register", registerStudent);
router.post("/teacher/register", registerTeacher);
router.post("/student/login", loginStudent);
router.post("/teacher/login", loginTeacher);

module.exports = router;
