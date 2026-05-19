const { validationResult } = require("express-validator");
const Transaction = require("../models/Transaction");
const Plan = require("../models/Plan");
const User = require("../models/User");
const { sendPurchaseApprovedEmail, sendPurchaseRejectedEmail } = require("../utils/email.util");

async function createPurchase(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { planId, amount, referenceId } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
    if (!plan.isActive) return res.status(400).json({ success: false, message: "Plan is not active" });
    if (amount < plan.minAmount) {
      return res.status(400).json({ success: false, message: `Minimum investment amount is ₹${plan.minAmount}` });
    }
    if (plan.maxAmount && amount > plan.maxAmount) {
      return res.status(400).json({ success: false, message: `Maximum investment amount is ₹${plan.maxAmount}` });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      plan: planId,
      type: "plan_purchase",
      amount,
      reference: referenceId,
      status: "pending",
      description: `Plan purchase: ${plan.name}`,
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getUserPurchases(req, res) {
  try {
    const transactions = await Transaction.find({
      user: req.user._id,
      type: { $in: ["plan_purchase", "profit"] },
    })
      .sort({ createdAt: -1 })
      .populate("plan", "name");

    res.json({ success: true, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function adminGetPurchases(req, res) {
  try {
    const filter = { type: "plan_purchase" };
    if (req.query.status) filter.status = req.query.status;

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("plan", "name");

    res.json({ success: true, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function approvePurchase(req, res) {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate("user", "name email")
      .populate("plan", "name");

    if (!transaction) return res.status(404).json({ success: false, message: "Transaction not found" });

    transaction.status = "completed";
    await transaction.save();

    if (transaction.user && transaction.user.email) {
      await sendPurchaseApprovedEmail(
        transaction.user.email,
        transaction.user.name,
        transaction.plan ? transaction.plan.name : "the plan",
        transaction.amount
      );
    }

    res.json({ success: true, data: transaction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function rejectPurchase(req, res) {
  try {
    const { reason } = req.body;

    const transaction = await Transaction.findById(req.params.id)
      .populate("user", "name email")
      .populate("plan", "name");

    if (!transaction) return res.status(404).json({ success: false, message: "Transaction not found" });

    transaction.status = "failed";
    transaction.rejectionReason = reason;
    await transaction.save();

    if (transaction.user && transaction.user.email) {
      await sendPurchaseRejectedEmail(
        transaction.user.email,
        transaction.user.name,
        transaction.plan ? transaction.plan.name : "the plan",
        transaction.amount,
        reason
      );
    }

    res.json({ success: true, data: transaction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { createPurchase, getUserPurchases, adminGetPurchases, approvePurchase, rejectPurchase };
