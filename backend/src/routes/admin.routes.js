const { Router } = require("express");
const { body, param } = require("express-validator");
const { protect } = require("../middleware/auth.middleware");
const { isAdmin } = require("../middleware/admin.middleware");
const {
  createDashboardUpdate,
  updateDashboardEntry,
  deleteDashboardEntry,
  addTransaction,
  getAllUsers,
  updateUser,
} = require("../controllers/admin.controller");
const { adminGetKYCRequests, adminReviewKYC } = require("../controllers/kyc.controller");
const { adminGetAllPlans, createPlan, updatePlan, deletePlan } = require("../controllers/plan.controller");
const { adminGetPurchases, approvePurchase, rejectPurchase } = require("../controllers/purchase.controller");
const { distributeProfit, bulkDistributeProfit } = require("../controllers/profit.controller");
const { getSettings, updateSettings } = require("../controllers/settings.controller");
const { adminGetAllGains, adminCreateGain, adminUpdateGain, adminDeleteGain, adminTogglePublish } = require("../controllers/memberGain.controller");

const router = Router();
router.use(protect, isAdmin);

// Dashboard management
router.post("/dashboard", [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").optional().trim(),
  body("stats").optional().isObject().withMessage("Stats must be an object"),
], createDashboardUpdate);

router.patch("/dashboard/:id", updateDashboardEntry);
router.delete("/dashboard/:id", deleteDashboardEntry);

// Transaction management
router.post("/transactions", [
  body("userId").isMongoId().withMessage("Valid user ID required"),
  body("type").isIn(["credit", "debit", "reward", "withdrawal"]).withMessage("Invalid transaction type"),
  body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("status").optional().isIn(["pending", "completed", "failed"]),
  body("reference").optional().trim(),
], addTransaction);

// User management
router.get("/users", getAllUsers);
router.patch("/users/:id", [
  param("id").isMongoId().withMessage("Valid user ID required"),
  body("name").optional().trim().notEmpty().isLength({ max: 80 }),
  body("phone").optional().trim().matches(/^[6-9]\d{9}$/),
  body("role").optional().isIn(["user", "admin"]).withMessage("Role must be user or admin"),
  body("isVerified").optional().isBoolean(),
], updateUser);

// KYC
router.get("/kyc", adminGetKYCRequests);
router.patch("/kyc/:id", adminReviewKYC);

// Plans
router.get("/plans", adminGetAllPlans);
router.post("/plans", [
  body("name").trim().notEmpty().withMessage("Plan name is required"),
  body("minAmount").isFloat({ min: 500 }).withMessage("Minimum amount must be at least 500"),
  body("durationMonths").isInt({ min: 1 }).withMessage("Duration must be at least 1 month"),
], createPlan);
router.patch("/plans/:id", updatePlan);
router.delete("/plans/:id", deletePlan);

// Purchases
router.get("/purchases", adminGetPurchases);
router.patch("/purchases/:id/approve", approvePurchase);
router.patch("/purchases/:id/reject", [
  body("reason").trim().notEmpty().withMessage("Rejection reason is required"),
], rejectPurchase);

// Profit
router.post("/profit", [
  body("userId").isMongoId().withMessage("Valid user ID required"),
  body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
], distributeProfit);
router.post("/profit/bulk", [
  body("userIds").isArray({ min: 1 }).withMessage("userIds must be a non-empty array"),
  body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
], bulkDistributeProfit);

// Settings
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

// Member Gains
router.get("/member-gains", adminGetAllGains);
router.post("/member-gains", adminCreateGain);
router.patch("/member-gains/:id", adminUpdateGain);
router.delete("/member-gains/:id", adminDeleteGain);
router.patch("/member-gains/:id/publish", adminTogglePublish);

module.exports = router;
