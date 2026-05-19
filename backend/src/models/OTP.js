const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email:     { type: String, required: true, lowercase: true },
  otp:       { type: String, required: true },
  isUsed:    { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // auto-delete after 10 min
});

module.exports = mongoose.model("OTP", otpSchema);
