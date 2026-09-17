// controllers/teacherController.js
// Teacher is VIEW-ONLY on students (needed to take attendance) and can
// see dashboard stats. Student CRUD (add/edit/delete) has moved to
// Admin — see controllers/adminController.js.

const Student = require("../models/Student");
const Attendance = require("../models/Attendance");

// GET /api/teacher/students?search=&class=
const getStudents = async (req, res) => {
  try {
    const { search, class: classFilter } = req.query;
    const query = {};

    if (classFilter && classFilter !== "All Classes") {
      query.class = classFilter;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { enrollmentNumber: { $regex: search, $options: "i" } },
      ];
    }

    const students = await Student.find(query).sort({ name: 1 });
    return res.status(200).json(students);
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// GET /api/teacher/students/:id
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }
    return res.status(200).json(student);
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// GET /api/teacher/dashboard  (stats for the dashboard cards)
const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const today = new Date().toISOString().slice(0, 10);

    const todayRecords = await Attendance.find({ date: today });
    const presentToday = todayRecords.filter((r) => r.status === "Present").length;
    const absentToday = todayRecords.filter((r) => r.status === "Absent").length;
    const attendancePercentage =
      todayRecords.length > 0 ? Number(((presentToday / todayRecords.length) * 100).toFixed(2)) : 0;

    return res.status(200).json({
      totalStudents,
      presentToday,
      absentToday,
      attendancePercentage,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  getDashboardStats,
};
