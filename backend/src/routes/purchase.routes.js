const { Router } = require("express");
const { protect } = require("../middleware/auth.middleware");
const { createPurchase, getUserPurchases } = require("../controllers/purchase.controller");
const { body } = require("express-validator");

const router = Router();
router.use(protect);

router.post("/", [
  body("planId").isMongoId().withMessage("Valid plan ID required"),
  body("amount").isFloat({ gt: 0 }).withMessage("Amount must be positive"),
  body("referenceId").trim().notEmpty().withMessage("Reference ID is required"),
], createPurchase);

router.get("/", getUserPurchases);

module.exports = router;
