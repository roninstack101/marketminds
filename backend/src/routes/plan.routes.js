const { Router } = require("express");
const { protect } = require("../middleware/auth.middleware");
const { getActivePlans } = require("../controllers/plan.controller");

const router = Router();
router.use(protect);
router.get("/", getActivePlans);

module.exports = router;
