// controllers/attendanceController.js
// Attendance marking, submission (bulk), duplicate prevention, and history/records.

const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

// GET /api/teacher/attendance/class-students?class=BCA%203rd%20Year&date=2026-09-06
// Returns all students in a class, each annotated with existing status for that date (if any)
const getClassForAttendance = async (req, res) => {
  try {
    const { class: className, date } = req.query;
    if (!className || !date) {
      return res.status(400).json({ message: "Class and date are required." });
    }

    const students = await Student.find({ class: className }).sort({ enrollmentNumber: 1 });
    const existingRecords = await Attendance.find({ class: className, date });

    const existingMap = {};
    existingRecords.forEach((r) => {
      existingMap[r.studentId.toString()] = r.status;
    });

    const result = students.map((s) => ({
      studentId: s._id,
      name: s.name,
      enrollmentNumber: s.enrollmentNumber,
      status: existingMap[s._id.toString()] || null, // null = not yet marked
    }));

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// POST /api/teacher/attendance
// Body: { class, date, attendance: [{ studentId, status }] }
// Creates new records; skips ones that already exist (reports them back) unless force update is used.
const submitAttendance = async (req, res) => {
  try {
    const { class: className, date, attendance } = req.body;

    if (!className || !date || !Array.isArray(attendance) || attendance.length === 0) {
      return res.status(400).json({ message: "Class, date, and attendance array are required." });
    }

    const created = [];
    const duplicates = [];

    for (const entry of attendance) {
      const { studentId, status } = entry;
      if (!studentId || !["Present", "Absent"].includes(status)) continue;

      // Check for existing record: class + date + student must be unique
      const existing = await Attendance.findOne({ studentId, class: className, date });
      if (existing) {
        duplicates.push(studentId);
        continue;
      }

      const record = await Attendance.create({
        studentId,
        class: className,
        date,
        status,
        markedBy: req.user.userId,
      });
      created.push(record);
    }

    if (created.length === 0 && duplicates.length > 0) {
      return res.status(409).json({
        message: "Attendance has already been submitted for this student on this date.",
        duplicates,
      });
    }

    return res.status(201).json({
      message: "Attendance submitted successfully.",
      created,
      duplicates,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Attendance has already been submitted for this student on this date.",
      });
    }
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// PUT /api/teacher/attendance/:id  (controlled update of an existing record)
const updateAttendance = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Present", "Absent"].includes(status)) {
      return res.status(400).json({ message: "Status must be Present or Absent." });
    }

    const record = await Attendance.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Attendance record not found." });
    }

    record.status = status;
    record.markedBy = req.user.userId;
    await record.save();

    return res.status(200).json({ message: "Attendance updated successfully.", record });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// GET /api/teacher/attendance?class=&date=&studentId=&status=
const getAttendanceRecords = async (req, res) => {
  try {
    const { class: className, date, studentId, status } = req.query;
    const query = {};
    if (className) query.class = className;
    if (date) query.date = date;
    if (studentId) query.studentId = studentId;
    if (status) query.status = status;

    const records = await Attendance.find(query)
      .populate("studentId", "name enrollmentNumber class")
      .sort({ date: -1 });

    return res.status(200).json(records);
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

module.exports = {
  getClassForAttendance,
  submitAttendance,
  updateAttendance,
  getAttendanceRecords,
};
