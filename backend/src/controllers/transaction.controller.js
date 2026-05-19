const Transaction = require("../models/Transaction");

// GET /api/transactions?page=1&limit=20
async function getTransactions(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments({ user: req.user._id }),
    ]);

    res.json({
      success: true,
      transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getTransactions };
