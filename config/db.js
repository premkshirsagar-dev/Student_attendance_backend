// config/db.js
// Handles connecting to MongoDB Atlas using the URI stored in .env

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Exit the process if we can't connect to the database
    process.exit(1);
  }
};

module.exports = connectDB;
