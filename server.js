// server.js
// Entry point: sets up Express, connects to MongoDB, mounts routes.

// Node's automatic DNS server detection can incorrectly resolve to 127.0.0.1
// on some Windows machines (often triggered by disconnected virtual adapters,
// e.g. VPN TAP adapters) even though the active network adapter has a valid
// DNS server configured. Setting real DNS servers explicitly avoids this.
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
<<<<<<< HEAD:server.js
dns.setDefaultResultOrder("ipv4first");

=======
require("dns").setDefaultResultOrder("ipv4first");
>>>>>>> 4b8c4a301c1d113e5aba0468d7ca13e077135bf2:backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Connect to MongoDB Atlas
connectDB();

// Middleware
<<<<<<< HEAD:server.js
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174", // add this
  "https://collegeattendanceprototype.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
=======
// app.use(cors());
// const allowedOrigins = [
//   "https://collegeattendancefrontend.vercel.app",
//   "http://localhost:5173", // keep this for local dev with Vite
// ];
const allowedOrigins = [
  "https://collegeattendanceprototype.vercel.app",   // ← to this (matches your real Vercel URL)
  "http://localhost:5173",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
>>>>>>> 4b8c4a301c1d113e5aba0468d7ca13e077135bf2:backend/server.js
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "College Attendance Management System API is running." });
});

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// Global error handler (safety net)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
