// models/Attendance.js
// Mongoose schema for an Attendance record.
// One record = one student's status for one class on one date.
// A day can have up to two check-ins — Noon and Afternoon — but only
// ONE record is ever stored per student/class/date: Afternoon overwrites
// Noon if both are taken (the "session" field shows which one it reflects).

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
    session: {
      // Which check-in this record currently reflects. A student's
      // stored record always shows the LATEST session taken for that
      // class/date — Afternoon overwrites Noon if both are taken.
      type: String,
      enum: ["Noon", "Afternoon"],
      required: true,
      default: "Noon",
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
