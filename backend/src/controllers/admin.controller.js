const { validationResult } = require("express-validator");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const DashboardData = require("../models/DashboardData");

// POST /api/admin/dashboard
async function createDashboardUpdate(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

  const { title, description, stats } = req.body;

  try {
    const entry = await DashboardData.create({
      title,
      description,
      stats,
      updatedBy: req.user._id,
    });
    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PATCH /api/admin/dashboard/:id
async function updateDashboardEntry(req, res) {
  try {
    const entry = await DashboardData.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );
    if (!entry) return res.status(404).json({ success: false, message: "Entry not found." });
    res.json({ success: true, data: entry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /api/admin/dashboard/:id
async function deleteDashboardEntry(req, res) {
  try {
    const entry = await DashboardData.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: "Entry not found." });
    res.json({ success: true, message: "Entry deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/admin/transactions
async function addTransaction(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

  const { userId, type, amount, description, status, reference } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const transaction = await Transaction.create({
      user: userId,
      type,
      amount,
      description,
      status,
      reference,
    });
    res.status(201).json({ success: true, transaction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/admin/users?page=1&limit=20
async function getAllUsers(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    res.json({
      success: true,
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PATCH /api/admin/users/:id
async function updateUser(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

  const allowed = ["name", "phone", "role", "isVerified"];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k))
  );

  try {
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/admin/users
async function createUser(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

  const { name, email, phone, password, role } = req.body;

  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ success: false, message: "Email already registered." });

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: role || "user",
      isVerified: true,
    });

    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /api/admin/users/:id
async function deleteUser(req, res) {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot delete your own account." });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    if (user.role === "admin") {
      return res.status(403).json({ success: false, message: "Admin accounts cannot be deleted." });
    }
    await user.deleteOne();
    res.json({ success: true, message: "User deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  createDashboardUpdate,
  updateDashboardEntry,
  deleteDashboardEntry,
  addTransaction,
  getAllUsers,
  updateUser,
  createUser,
  deleteUser,
};
