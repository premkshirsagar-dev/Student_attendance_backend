// middleware/authMiddleware.js
// Verifies the JWT on protected routes and enforces role-based access.
// This is the actual security boundary — the React app hiding a button
// is just UX, this middleware is what actually blocks the request.

const jwt = require("jsonwebtoken");

// 1. Checks that a valid JWT is present. Attaches decoded { userId, email, role } to req.user
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token invalid or expired." });
  }
};

// 2. Restricts a route to specific roles, e.g. authorize("teacher")
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You are not authorized to access this resource.",
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
