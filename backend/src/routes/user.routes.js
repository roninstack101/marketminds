const { Router } = require("express");
const { body } = require("express-validator");
const { protect } = require("../middleware/auth.middleware");
const { getProfile, updateProfile, getBankDetails, saveBankDetails } = require("../controllers/user.controller");
const { submitKYC } = require("../controllers/kyc.controller");

const router = Router();
router.use(protect);

router.get("/profile", getProfile);
router.patch("/profile", [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty").isLength({ max: 80 }),
  body("phone").optional().trim().matches(/^[6-9]\d{9}$/).withMessage("Valid 10-digit Indian mobile number required"),
], updateProfile);

router.get("/bank-details", getBankDetails);
router.put("/bank-details", [
  body("accountHolderName").trim().notEmpty().withMessage("Account holder name is required"),
  body("accountNumber").trim().matches(/^\d{9,18}$/).withMessage("Account number must be 9–18 digits"),
  body("ifscCode").trim().toUpperCase().matches(/^[A-Z]{4}0[A-Z0-9]{6}$/).withMessage("Invalid IFSC code format"),
  body("bankName").trim().notEmpty().withMessage("Bank name is required"),
  body("upiId").trim().matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/).withMessage("Invalid UPI ID format"),
], saveBankDetails);

router.post("/kyc/submit", submitKYC);

module.exports = router;
