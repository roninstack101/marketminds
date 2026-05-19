const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const OTP = require("../models/OTP");
const { generateOTP, otpExpiryDate } = require("../utils/otp.util");
const { sendOTPEmail } = require("../utils/email.util");

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
}

const REFERRAL_MAP = {
  [(process.env.VISHAL_REF_CODE || "VISHAL").toUpperCase()]: "vishal",
  [(process.env.BABLU_REF_CODE  || "BABLU").toUpperCase()]:  "bablu",
};

function resolveReferralGroup(code) {
  if (!code || !code.trim()) return null;
  return REFERRAL_MAP[code.trim().toUpperCase()] || null;
}

// POST /api/auth/register
async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

  const { name, email, phone, password, referralCode } = req.body;
  const referralGroup = resolveReferralGroup(referralCode);

  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing && existing.isVerified) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    // Overwrite unverified duplicate so user can retry registration
    if (existing && !existing.isVerified) {
      existing.name = name;
      existing.phone = phone;
      existing.password = password;
      existing.referralGroup = referralGroup;
      await existing.save();
    } else {
      await User.create({ name, email, phone, password, referralGroup });
    }

    const otp = generateOTP();
    await OTP.deleteMany({ email: email.toLowerCase() }); // clear old OTPs
    await OTP.create({ email: email.toLowerCase(), otp, expiresAt: otpExpiryDate() });
    await sendOTPEmail(email, name, otp);

    res.status(201).json({ success: true, message: "OTP sent to your email. Please verify to complete registration." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/auth/verify-otp
async function verifyOTP(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

  const { email, otp } = req.body;

  try {
    const record = await OTP.findOne({ email: email.toLowerCase(), isUsed: false });
    if (!record) return res.status(400).json({ success: false, message: "No active OTP found. Please request a new one." });
    if (new Date() > record.expiresAt) return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    if (record.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP." });

    record.isUsed = true;
    await record.save();

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { isVerified: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const token = signToken(user._id);
    res.json({ success: true, message: "Email verified successfully.", token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/auth/resend-otp
async function resendOTP(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: "No account found with this email." });
    if (user.isVerified) return res.status(400).json({ success: false, message: "Account already verified." });

    const otp = generateOTP();
    await OTP.deleteMany({ email: email.toLowerCase() });
    await OTP.create({ email: email.toLowerCase(), otp, expiresAt: otpExpiryDate() });
    await sendOTPEmail(email, user.name, otp);

    res.json({ success: true, message: "New OTP sent to your email." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/auth/login
async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) return res.status(401).json({ success: false, message: "Invalid email or password." });
    if (!user.isVerified) return res.status(403).json({ success: false, message: "Please verify your email first." });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid email or password." });

    const token = signToken(user._id);
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { register, verifyOTP, resendOTP, login };
