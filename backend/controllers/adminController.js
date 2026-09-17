// controllers/adminController.js
// Three responsibilities for an Admin (e.g. Principal):
//   1. Full CRUD on Teacher accounts
//   2. Full CRUD on Student accounts (moved here from Teacher — Teacher
//      is now view-only on students, needed just for taking attendance)
//   3. Full CRUD on OTHER Admin accounts
// There is no public self-registration for Students, Teachers, or (after
// the first Admin exists) for Admins — every account past the very first
// Admin is created by an existing Admin through this controller.

const bcrypt = require("bcryptjs");
const Teacher = require("../models/Teacher");
const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");

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

// PUT /api/admin/teachers/:id
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

// GET /api/admin/students?search=&class=
async function createStudent(req, res) {
  try {
    const { name, studentId, class: studentClass, fatherName, motherName } = req.body;

    if (!name || !studentId || !studentClass) {
      return res.status(400).json({ message: "Name, Student ID, and Class are required." });
    }

    const existing = await Student.findOne({ studentId: studentId.trim().toUpperCase() });
    if (existing) {
      return res.status(409).json({ message: "A student with this Student ID already exists." });
    }

    const student = await Student.create({
      name,
      studentId,
      class: studentClass,
      fatherName,
      motherName,
    });

    return res.status(201).json({ message: "Student added successfully.", student });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A student with this Student ID already exists." });
    }
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
}
// GET /api/admin/students/:id
async function getStudentById(req, res) {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }
    return res.status(200).json(student);
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
}

// POST /api/admin/students  (Admin adds a new student)
async function createStudent(req, res) {
  try {
    const { name, email, password, enrollmentNumber, class: studentClass } = req.body;

    if (!name || !email || !password || !enrollmentNumber || !studentClass) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existing = await Student.findOne({
      $or: [{ email: email.toLowerCase() }, { enrollmentNumber: enrollmentNumber.toUpperCase() }],
    });
    if (existing) {
      return res.status(409).json({ message: "Student already registered." });
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
      return res.status(409).json({ message: "Student already registered." });
    }
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
}

// PUT /api/admin/students/:id
async function updateStudent(req, res) {
  try {
    const { name, studentId, class: studentClass, fatherName, motherName } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    if (name) student.name = name;
    if (studentId) student.studentId = studentId;
    if (studentClass) student.class = studentClass;
    if (fatherName !== undefined) student.fatherName = fatherName;
    if (motherName !== undefined) student.motherName = motherName;

    await student.save();
    return res.status(200).json({ message: "Student updated successfully.", student });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A student with this Student ID already exists." });
    }
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
}

// DELETE /api/admin/students/:id
async function deleteStudent(req, res) {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }
    await Attendance.deleteMany({ studentId: req.params.id });
    return res.status(200).json({ message: "Student deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
}

// GET /api/admin/admins?search=
async function getAdmins(req, res) {
  try {
    const { search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const admins = await Admin.find(query).sort({ name: 1 });
    return res.status(200).json(admins);
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
}

// GET /api/admin/admins/:id
async function getAdminById(req, res) {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }
    return res.status(200).json(admin);
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
}

// POST /api/admin/admins
async function createAdmin(req, res) {
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
      return res.status(409).json({ message: "Admin already exists with this email." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ name, email, password: hashedPassword });

    return res.status(201).json({ message: "Admin added successfully.", admin });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Admin already exists with this email." });
    }
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
}

// PUT /api/admin/admins/:id
async function updateAdmin(req, res) {
  try {
    const { name, email } = req.body;

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    if (name) admin.name = name;
    if (email) admin.email = email;

    await admin.save();
    return res.status(200).json({ message: "Admin updated successfully.", admin });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already in use." });
    }
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
}

// DELETE /api/admin/admins/:id
async function deleteAdmin(req, res) {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }
    return res.status(200).json({ message: "Admin deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
}

module.exports = {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
