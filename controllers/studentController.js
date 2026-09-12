// controllers/studentController.js
// Everything a logged-in STUDENT is allowed to do: view own profile,
// view own attendance. No write operations live here by design.

const Student = require("../models/Student");
const Attendance = require("../models/Attendance");

// GET /api/student/profile
const getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.userId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }
    return res.status(200).json(student);
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// GET /api/student/attendance
// Returns this student's full attendance history + calculated percentage.
// Percentage is always calculated on the fly, never stored, so it can't go stale.
const getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ studentId: req.user.userId }).sort({ date: -1 });

    const totalClasses = records.length;
    const presentCount = records.filter((r) => r.status === "Present").length;
    const absentCount = totalClasses - presentCount;
    const percentage = totalClasses > 0 ? Number(((presentCount / totalClasses) * 100).toFixed(2)) : 0;

    return res.status(200).json({
      totalClasses,
      present: presentCount,
      absent: absentCount,
      percentage,
      history: records,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

module.exports = { getProfile, getMyAttendance };
