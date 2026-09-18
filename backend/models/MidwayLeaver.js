// models/MidwayLeaver.js
// A lightweight log entry created whenever the Afternoon attendance
// check finds a student who was Present at Noon but is now Absent —
// i.e. they likely left partway through the day. We don't keep the
// full Noon dataset once Afternoon overwrites it, but this log
// preserves the *fact* that a student left midway, so Admin/Teacher
// can check it later.

const mongoose = require("mongoose");

const midwayLeaverSchema = new mongoose.Schema(
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
      // "YYYY-MM-DD", matches Attendance's date format
      type: String,
      required: true,
    },
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true } // createdAt = when this was flagged
);

module.exports = mongoose.model("MidwayLeaver", midwayLeaverSchema);
