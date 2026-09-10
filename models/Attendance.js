// models/Attendance.js
// Mongoose schema for an Attendance record.
// One record = one student's status for one class on one date.

const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    class: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      // Stored as a plain "YYYY-MM-DD" string so equality checks
      // (for the duplicate-prevention rule) are simple and exact.
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent"],
      required: true,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
  },
  { timestamps: true }
);

// CRITICAL RULE: a student can only have ONE attendance record
// per class per date. This compound unique index enforces that
// at the database level, in addition to any checks in the controller.
attendanceSchema.index(
  { studentId: 1, class: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
