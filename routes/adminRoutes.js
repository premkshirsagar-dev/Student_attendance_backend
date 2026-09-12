// routes/adminRoutes.js
// Every route here requires a valid JWT AND role === "admin"
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} = require("../controllers/adminController");

router.use(protect, authorize("admin"));

router.get("/teachers", getTeachers);
router.get("/teachers/:id", getTeacherById);
router.post("/teachers", createTeacher);
router.put("/teachers/:id", updateTeacher);
router.delete("/teachers/:id", deleteTeacher);

module.exports = router;
