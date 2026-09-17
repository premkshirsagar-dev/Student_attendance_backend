// controllers/authController.js
// Handles LOGIN ONLY for Students and Teachers, plus register+login for Admin.
// NOTE: There is no public Student or Teacher self-registration — both
// account types are created exclusively by an authenticated Admin
// (see controllers/adminController.js).

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Admin = require("../models/Admin");

// Helper: sign a JWT containing the fields the middleware expects
const generateToken = (user, role) => {
  return jwt.sign(
    { userId: user._id, email: user.email || user.studentId, role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ---------- ADMIN REGISTER ----------
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Admin already registered. Please login." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Admin registration successful. Please login.",
      admin,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Admin already registered. Please login." });
    }
    return res.status(500).json({ message: "Server error during registration.", error: error.message });
  }
};

// ---------- STUDENT LOGIN ----------
const loginStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required." });
    }

    const student = await Student.findOne({ studentId: studentId.trim().toUpperCase() });
    if (!student) {
      return res.status(401).json({ message: "Invalid Student ID." });
    }

    const token = generateToken(student, "student");
    return res.status(200).json({
      message: "Login successful",
      token,
      user: student,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error during login.", error: error.message });
  }
};

// ---------- TEACHER LOGIN ----------
const loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const teacher = await Teacher.findOne({ email: email.toLowerCase() });
    if (!teacher) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(teacher, "teacher");
    return res.status(200).json({
      message: "Login successful",
      token,
      user: teacher,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error during login.", error: error.message });
  }
};

// ---------- ADMIN LOGIN ----------
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(admin, "admin");
    return res.status(200).json({
      message: "Login successful",
      token,
      user: admin,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error during login.", error: error.message });
  }
};

module.exports = {
  registerAdmin,
  loginStudent,
  loginTeacher,
  loginAdmin,
};
