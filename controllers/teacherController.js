// controllers/teacherController.js
// Student management (CRUD, search, filter) + dashboard stats.
// Only accessible to authenticated users with role "teacher" (enforced in routes).

const bcrypt = require("bcryptjs");
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
        { email: { $regex: search, $options: "i" } },
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

// POST /api/teacher/students  (teacher adds a new student)
const createStudent = async (req, res) => {
  try {
    const { name, email, password, enrollmentNumber, class: studentClass } = req.body;

    if (!name || !email || !password || !enrollmentNumber || !studentClass) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existing = await Student.findOne({
      $or: [{ email: email.toLowerCase() }, { enrollmentNumber: enrollmentNumber.toUpperCase() }],
    });
    if (existing) {
      return res.status(409).json({ message: "Student already registered. Please login." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await Student.create({
      name,
      email,
      password: hashedPassword,
      enrollmentNumber,
      class: studentClass,
    });

    return res.status(201).json({ message: "Student added successfully.", student });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Student already registered. Please login." });
    }
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// PUT /api/teacher/students/:id  (name, email, enrollmentNumber, class only — never password here)
const updateStudent = async (req, res) => {
  try {
    const { name, email, enrollmentNumber, class: studentClass } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    if (name) student.name = name;
    if (email) student.email = email;
    if (enrollmentNumber) student.enrollmentNumber = enrollmentNumber;
    if (studentClass) student.class = studentClass;

    await student.save();
    return res.status(200).json({ message: "Student updated successfully.", student });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email or enrollment number already in use." });
    }
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// DELETE /api/teacher/students/:id
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }
    // Also clean up their attendance records
    await Attendance.deleteMany({ studentId: req.params.id });
    return res.status(200).json({ message: "Student deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// GET /api/teacher/dashboard  (stats for the dashboard cards)
const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

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
  createStudent,
  updateStudent,
  deleteStudent,
  getDashboardStats,
};
