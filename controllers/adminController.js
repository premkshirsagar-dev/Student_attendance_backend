// controllers/adminController.js
// Everything an Admin (e.g. Principal) can do: full CRUD on Teacher accounts.
// This is the only way Teacher accounts get created now — there is no
// public Teacher registration page anymore.

const bcrypt = require("bcryptjs");
const Teacher = require("../models/Teacher");

// GET /api/admin/teachers?search=
const getTeachers = async (req, res) => {
  try {
    const { search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const teachers = await Teacher.find(query).sort({ name: 1 });
    return res.status(200).json(teachers);
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// GET /api/admin/teachers/:id
const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }
    return res.status(200).json(teacher);
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// POST /api/admin/teachers  (Admin creates a new Teacher account)
const createTeacher = async (req, res) => {
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
      return res.status(409).json({ message: "Teacher already exists with this email." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = await Teacher.create({ name, email, password: hashedPassword });

    return res.status(201).json({ message: "Teacher added successfully.", teacher });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Teacher already exists with this email." });
    }
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// PUT /api/admin/teachers/:id  (name, email only — password reset not included here)
const updateTeacher = async (req, res) => {
  try {
    const { name, email } = req.body;

    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    if (name) teacher.name = name;
    if (email) teacher.email = email;

    await teacher.save();
    return res.status(200).json({ message: "Teacher updated successfully.", teacher });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already in use." });
    }
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// DELETE /api/admin/teachers/:id
const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }
    return res.status(200).json({ message: "Teacher deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

module.exports = { getTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher };
