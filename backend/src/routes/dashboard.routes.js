const { Router } = require("express");
const { protect } = require("../middleware/auth.middleware");
const { getDashboard, getUserStats } = require("../controllers/dashboard.controller");

const router = Router();
router.use(protect);

router.get("/stats", getUserStats);
router.get("/", getDashboard);

module.exports = router;
