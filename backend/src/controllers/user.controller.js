const { validationResult } = require("express-validator");
const User = require("../models/User");

const REFERRAL_MAP = {
  [(process.env.VISHAL_REF_CODE || "VISHAL").toUpperCase()]: "vishal",
  [(process.env.BABLU_REF_CODE  || "BABLU").toUpperCase()]:  "bablu",
};
function resolveReferralGroup(code) {
  if (!code || !code.trim()) return null;
  return REFERRAL_MAP[code.trim().toUpperCase()] || null;
}

// GET /api/user/profile
async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PATCH /api/user/profile
async function updateProfile(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

  const { name, phone, referralCode } = req.body;

  try {
    const current = await User.findById(req.user._id);
    if (!current) return res.status(404).json({ success: false, message: "User not found." });

    const update = {
      ...(name && { name }),
      ...(phone && { phone }),
    };

    // Only set referralGroup if not already assigned and code resolves to a valid group
    if (referralCode && !current.referralGroup) {
      const group = resolveReferralGroup(referralCode);
      if (!group) return res.status(400).json({ success: false, message: "Invalid reference code." });
      update.referralGroup = group;
    }

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/user/bank-details
async function getBankDetails(req, res) {
  try {
    const user = await User.findById(req.user._id).select("bankDetails");
    res.json({ success: true, bankDetails: user.bankDetails });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PUT /api/user/bank-details
async function saveBankDetails(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

  const { accountHolderName, accountNumber, ifscCode, bankName, upiId } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { bankDetails: { accountHolderName, accountNumber, ifscCode: ifscCode.toUpperCase(), bankName, upiId } },
      { new: true, runValidators: true }
    );
    res.json({ success: true, bankDetails: user.bankDetails });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getProfile, updateProfile, getBankDetails, saveBankDetails };
