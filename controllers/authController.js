// controllers/authController.js
// Handles registration and login for both Students and Teachers.

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

// Helper: sign a JWT containing the fields the middleware expects
const generateToken = (user, role) => {
  return jwt.sign(
    { userId: user._id, email: user.email, role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ---------- STUDENT REGISTER ----------
const registerStudent = async (req, res) => {
  try {
    const { name, email, password, enrollmentNumber, class: studentClass } = req.body;

    if (!name || !email || !password || !enrollmentNumber || !studentClass) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existingByEmail = await Student.findOne({ email: email.toLowerCase() });
    const existingByEnrollment = await Student.findOne({
      enrollmentNumber: enrollmentNumber.toUpperCase(),
    });

    if (existingByEmail || existingByEnrollment) {
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

    return res.status(201).json({
      message: "Registration successful. Please login.",
      student,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Student already registered. Please login." });
    }
    return res.status(500).json({ message: "Server error during registration.", error: error.message });
  }
};

// ---------- TEACHER REGISTER ----------
const registerTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existing = await Teacher.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Teacher already registered. Please login." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await Teacher.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Teacher registration successful. Please login.",
      teacher,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Teacher already registered. Please login." });
    }
    return res.status(500).json({ message: "Server error during registration.", error: error.message });
  }
};

// ---------- STUDENT LOGIN ----------
const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
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

module.exports = {
  registerStudent,
  registerTeacher,
  loginStudent,
  loginTeacher,
};
