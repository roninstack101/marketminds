const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const { sendProfitCreditedEmail } = require("../utils/email.util");

async function distributeProfit(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { userId, amount, note } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }
    if (amount <= 0) {
      return res.status(400).json({ success: false, message: "Amount must be greater than 0" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const transaction = await Transaction.create({
      user: userId,
      type: "profit",
      amount,
      description: note || "Profit credited",
      status: "completed",
    });

    res.status(201).json({ success: true, transaction });

    // Send email after responding so it never blocks the request
    sendProfitCreditedEmail(user.email, user.name, amount, note).catch(console.error);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function bulkDistributeProfit(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { userIds, amount, note } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: "userIds must be a non-empty array" });
    }
    if (amount <= 0) {
      return res.status(400).json({ success: false, message: "Amount must be greater than 0" });
    }

    const users = await User.find({ _id: { $in: userIds } });

    const transactions = await Transaction.insertMany(
      users.map((u) => ({
        user: u._id,
        type: "profit",
        amount,
        description: note || "Profit credited",
        status: "completed",
      }))
    );

    res.status(201).json({ success: true, count: transactions.length });

    Promise.allSettled(
      users.map((u) => sendProfitCreditedEmail(u.email, u.name, amount, note))
    ).catch(console.error);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { distributeProfit, bulkDistributeProfit };
