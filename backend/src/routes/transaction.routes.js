const { Router } = require("express");
const { protect } = require("../middleware/auth.middleware");
const { getTransactions } = require("../controllers/transaction.controller");

const router = Router();
router.use(protect);

router.get("/", getTransactions);

module.exports = router;
