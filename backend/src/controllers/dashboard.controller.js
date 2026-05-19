const DashboardData = require("../models/DashboardData");
const Transaction = require("../models/Transaction");

function anonymizeName(name) {
  if (!name) return "Member";
  const parts = name.trim().split(/\s+/);
  const first = parts[0];
  const lastInitial = parts.length > 1 ? parts[parts.length - 1][0].toUpperCase() + "." : "";
  return lastInitial ? `${first} ${lastInitial}` : first;
}

// GET /api/dashboard
async function getDashboard(req, res) {
  try {
    const entries = await DashboardData.find({ isActive: true })
      .sort({ createdAt: -1 })
      .populate("updatedBy", "name email");
    res.json({ success: true, data: entries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/dashboard/stats — per-user KPIs computed from real transactions
async function getUserStats(req, res) {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const transactions = await Transaction.find({
      user: userId,
      status: "completed",
      type: { $in: ["plan_purchase", "profit"] },
    });

    const totalInvested = transactions
      .filter((t) => t.type === "plan_purchase")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalReturns = transactions
      .filter((t) => t.type === "profit")
      .reduce((sum, t) => sum + t.amount, 0);

    const currentValue = totalInvested + totalReturns;
    const returnsPct = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

    const monthlyReturn = transactions
      .filter((t) => t.type === "profit" && new Date(t.createdAt) >= startOfMonth)
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyReturnPct = totalInvested > 0 ? (monthlyReturn / totalInvested) * 100 : 0;

    res.json({
      success: true,
      data: { totalInvested, currentValue, totalReturns, returnsPct, monthlyReturn, monthlyReturnPct },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/dashboard/gains — computed live from real transactions
async function getComputedGains(req, res) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const transactions = await Transaction.find({
      status: "completed",
      type: { $in: ["plan_purchase", "profit"] },
    }).populate("user", "name");

    const userMap = {};

    for (const tx of transactions) {
      if (!tx.user) continue;
      const uid = tx.user._id.toString();
      if (!userMap[uid]) {
        userMap[uid] = {
          _id: uid,
          memberName: anonymizeName(tx.user.name),
          invested: 0,
          returns: 0,
          monthlyReturn: 0,
        };
      }
      if (tx.type === "plan_purchase") {
        userMap[uid].invested += tx.amount;
      } else if (tx.type === "profit") {
        userMap[uid].returns += tx.amount;
        if (new Date(tx.createdAt) >= startOfMonth) {
          userMap[uid].monthlyReturn += tx.amount;
        }
      }
    }

    const gains = Object.values(userMap)
      .filter((u) => u.invested > 0)
      .map((u) => ({
        _id: u._id,
        memberName: u.memberName,
        invested: u.invested,
        currentValue: u.invested + u.returns,
        totalReturnPct: (u.returns / u.invested) * 100,
        monthlyReturnPct: (u.monthlyReturn / u.invested) * 100,
      }))
      .sort((a, b) => b.totalReturnPct - a.totalReturnPct)
      .slice(0, 10);

    res.json({ success: true, data: gains });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getDashboard, getUserStats, getComputedGains };
