const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  profilePic: {
    type: String,
    required: false,
  },
  mobile: {
    type: String,
    required: false,
  },
  token: {
    type: String,
  },
  role: {
    type: String,
    default: "ADMIN",
  },
  emailotp: {
    type: String,
  },
  mobileotp: {
    type: String,
  }
}, { timestamps: true });

adminSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
}

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
