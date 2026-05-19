const User = require("../models/User");
const { sendKYCApprovedEmail, sendKYCRejectedEmail } = require("../utils/email.util");

async function submitKYC(req, res) {
  try {
    const user = await User.findById(req.user._id);

    if (user.kycStatus === "approved") {
      return res.status(400).json({ success: false, message: "Your KYC is already approved" });
    }

    if (!user.bankDetails || !user.bankDetails.accountNumber) {
      return res.status(400).json({ success: false, message: "Bank details are required before submitting KYC" });
    }

    user.kycStatus = "pending";
    user.kycSubmittedAt = new Date();
    await user.save();

    res.json({ success: true, kycStatus: "pending" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function adminGetKYCRequests(req, res) {
  try {
    const filter = {};
    if (req.query.status) {
      filter.kycStatus = req.query.status;
    } else {
      filter.kycStatus = "pending";
    }

    const users = await User.find(filter).select(
      "name email phone bankDetails kycStatus kycSubmittedAt kycReviewedAt kycRejectionReason"
    );

    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function adminReviewKYC(req, res) {
  try {
    const { action, reason } = req.body;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ success: false, message: "Action must be 'approve' or 'reject'" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (action === "approve") {
      user.kycStatus = "approved";
      user.kycReviewedAt = new Date();
      await user.save();
      await sendKYCApprovedEmail(user.email, user.name);
    } else {
      user.kycStatus = "rejected";
      user.kycRejectionReason = reason;
      user.kycReviewedAt = new Date();
      await user.save();
      await sendKYCRejectedEmail(user.email, user.name, reason);
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { submitKYC, adminGetKYCRequests, adminReviewKYC };
