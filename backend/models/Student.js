// models/Student.js
// Mongoose schema for a Student user

const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    enrollmentNumber: {
      type: String,
      required: [true, "Enrollment number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    class: {
      type: String,
      required: [true, "Class is required"],
      trim: true,
    },
    role: {
      type: String,
      default: "student",
      immutable: true, // role can never be changed once set
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// Never send the password back in API responses
studentSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("Student", studentSchema);
