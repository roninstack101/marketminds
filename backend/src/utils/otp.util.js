const crypto = require("crypto");

function generateOTP() {
  // Cryptographically secure 6-digit OTP
  return String(crypto.randomInt(100000, 999999));
}

function otpExpiryDate() {
  const minutes = parseInt(process.env.OTP_EXPIRES_MINUTES || "10", 10);
  return new Date(Date.now() + minutes * 60 * 1000);
}

module.exports = { generateOTP, otpExpiryDate };
