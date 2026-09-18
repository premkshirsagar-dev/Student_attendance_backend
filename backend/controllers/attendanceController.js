// controllers/attendanceController.js
// Attendance marking, submission (bulk), duplicate prevention, and history/records.
// Supports two check-in sessions per day — Noon and Afternoon. Afternoon
// overwrites Noon's stored record (only one record per student/class/date
// ever exists, matching the unique index). If a student was Present at
// Noon but Absent in the Afternoon submission, that's logged as a
// "midway leaver" — see models/MidwayLeaver.js.

const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const MidwayLeaver = require("../models/MidwayLeaver");

// GET /api/teacher/attendance/class-students?class=BCA%203rd%20Year&date=2026-09-06
// Returns all students in a class, each annotated with their CURRENT
// stored status (whichever session was taken most recently) for that date.
const getClassForAttendance = async (req, res) => {
  try {
    const { class: className, date } = req.query;
    if (!className || !date) {
      return res.status(400).json({ message: "Class and date are required." });
    }

    const students = await Student.find({ class: className }).sort({ studentId: 1 });
    const existingRecords = await Attendance.find({ class: className, date });

    const existingMap = {};
    existingRecords.forEach((r) => {
      existingMap[r.studentId.toString()] = { status: r.status, session: r.session };
    });

    const result = students.map((s) => {
      const existing = existingMap[s._id.toString()];
      return {
        studentId: s._id, // ObjectId — used to link attendance records
        studentCode: s.studentId, // human-readable Student ID (e.g. "BCA001")
        name: s.name,
        status: existing ? existing.status : null, // null = not yet marked
        session: existing ? existing.session : null, // which session this reflects
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// POST /api/teacher/attendance
// Body: { class, date, session: "Noon" | "Afternoon", attendance: [{ studentId, status }] }
//
// Noon: creates new records as normal (still blocks a second Noon
//   submission for the same student/class/date - use the update
//   endpoint to correct a mistake instead of resubmitting).
// Afternoon: OVERWRITES each student's existing record for that
//   class/date with the Afternoon result. Any student who was Present
//   at Noon and is now Absent gets logged as a "midway leaver" before
//   being overwritten, and the list of those students is returned so
//   the frontend can show an alert.
const submitAttendance = async (req, res) => {
  try {
    const { class: className, date, session, attendance } = req.body;

    if (!className || !date || !Array.isArray(attendance) || attendance.length === 0) {
      return res.status(400).json({ message: "Class, date, and attendance array are required." });
    }
    if (!["Noon", "Afternoon"].includes(session)) {
      return res.status(400).json({ message: "Session must be Noon or Afternoon." });
    }

    const created = [];
    const duplicates = [];
    const midwayLeavers = []; // studentId values

    for (const entry of attendance) {
      const { studentId, status } = entry;
      if (!studentId || !["Present", "Absent"].includes(status)) continue;

      const existing = await Attendance.findOne({ studentId, class: className, date });

      if (session === "Noon") {
        if (existing) {
          duplicates.push(studentId);
          continue;
        }
        const record = await Attendance.create({
          studentId, class: className, date, status, session, markedBy: req.user.userId,
        });
        created.push(record);
        continue;
      }

      // session === "Afternoon" — overwrite whatever is currently stored.
      if (existing) {
        if (existing.status === "Present" && status === "Absent") {
          await MidwayLeaver.create({
            studentId, class: className, date, flaggedBy: req.user.userId,
          });
          midwayLeavers.push(studentId);
        }
        existing.status = status;
        existing.session = "Afternoon";
        existing.markedBy = req.user.userId;
        await existing.save();
        created.push(existing);
      } else {
        const record = await Attendance.create({
          studentId, class: className, date, status, session, markedBy: req.user.userId,
        });
        created.push(record);
      }
    }

    if (session === "Noon" && created.length === 0 && duplicates.length > 0) {
      return res.status(409).json({
        message: "Attendance has already been submitted for this student on this date.",
        duplicates,
      });
    }

    let midwayLeaverDetails = [];
    if (midwayLeavers.length > 0) {
      const students = await Student.find({ _id: { $in: midwayLeavers } });
      midwayLeaverDetails = students.map((s) => ({ name: s.name, studentCode: s.studentId }));
    }

    return res.status(201).json({
      message: "Attendance submitted successfully.",
      created,
      duplicates,
      midwayLeavers: midwayLeaverDetails,
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
      .populate("studentId", "name studentId class")
      .sort({ date: -1 });

    return res.status(200).json(records);
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// GET /api/teacher/attendance/rankings?class=BCA+3rd+Year&month=2026-09
// GET /api/teacher/attendance/rankings?class=BCA+3rd+Year&year=2026
const getAttendanceRankings = async (req, res) => {
  try {
    const { class: className, month, year } = req.query;

    if (!className) {
      return res.status(400).json({ message: "Class is required." });
    }
    if (!month && !year) {
      return res.status(400).json({ message: "Provide either a month (YYYY-MM) or a year (YYYY)." });
    }

    let startDate, endDate;
    if (month) {
      startDate = `${month}-01`;
      endDate = `${month}-31`;
    } else {
      startDate = `${year}-01-01`;
      endDate = `${year}-12-31`;
    }

    const rankings = await Attendance.aggregate([
      {
        $match: {
          class: className,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$studentId",
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      {
        $project: {
          _id: 0,
          studentId: "$_id",
          name: "$student.name",
          studentCode: "$student.studentId",
          total: 1,
          present: 1,
          absent: { $subtract: ["$total", "$present"] },
          percentage: {
            $round: [{ $multiply: [{ $divide: ["$present", "$total"] }, 100] }, 2],
          },
        },
      },
      { $sort: { percentage: -1, name: 1 } },
    ]);

    return res.status(200).json(rankings);
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// GET /api/teacher/attendance/midway-leavers?class=&date=
// Returns the log of students flagged as having left midway (Present
// at Noon, Absent by the Afternoon check). Filterable by class/date;
// returns everything, newest first, if no filters given.
const getMidwayLeavers = async (req, res) => {
  try {
    const { class: className, date } = req.query;
    const query = {};
    if (className) query.class = className;
    if (date) query.date = date;

    const leavers = await MidwayLeaver.find(query)
      .populate("studentId", "name studentId class")
      .sort({ createdAt: -1 });

    return res.status(200).json(leavers);
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

module.exports = {
  getClassForAttendance,
  submitAttendance,
  updateAttendance,
  getAttendanceRecords,
  getAttendanceRankings,
  getMidwayLeavers,
};
