const { Router } = require("express");
const { body } = require("express-validator");
const { register, verifyOTP, resendOTP, login, forgotPassword, resetPassword } = require("../controllers/auth.controller");

const router = Router();

const nameRule = body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 80 }).withMessage("Name too long");
const emailRule = body("email").trim().toLowerCase().isEmail().withMessage("Valid email required");
const phoneRule = body("phone").trim().matches(/^[6-9]\d{9}$/).withMessage("Valid 10-digit Indian mobile number required");
const passwordRule = body("password")
  .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
  .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter")
  .matches(/[a-z]/).withMessage("Password must contain a lowercase letter")
  .matches(/\d/).withMessage("Password must contain a digit");
const otpRule = body("otp").trim().matches(/^\d{6}$/).withMessage("OTP must be a 6-digit number");

router.post("/register", [nameRule, emailRule, phoneRule, passwordRule], register);
router.post("/verify-otp", [emailRule, otpRule], verifyOTP);
router.post("/resend-otp", [emailRule], resendOTP);
router.post("/login", [emailRule, body("password").notEmpty().withMessage("Password is required")], login);
router.post("/forgot-password", [emailRule], forgotPassword);
router.post("/reset-password", [
  emailRule,
  body("otp").trim().matches(/^\d{6}$/).withMessage("OTP must be a 6-digit number"),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter")
    .matches(/[a-z]/).withMessage("Password must contain a lowercase letter")
    .matches(/\d/).withMessage("Password must contain a digit"),
], resetPassword);

module.exports = router;
