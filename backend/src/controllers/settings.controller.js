const Settings = require("../models/Settings");

async function getSettings(req, res) {
  try {
    const settings = await Settings.findOneAndUpdate(
      { _id: "global" },
      { $setOnInsert: { _id: "global" } },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateSettings(req, res) {
  try {
    const { paymentQrCode, paymentInstructions, paymentEmail, paymentUpiId } = req.body;
    const update = {};
    if (paymentQrCode !== undefined) update.paymentQrCode = paymentQrCode;
    if (paymentInstructions !== undefined) update.paymentInstructions = paymentInstructions;
    if (paymentEmail !== undefined) update.paymentEmail = paymentEmail;
    if (paymentUpiId !== undefined) update.paymentUpiId = paymentUpiId;

    const settings = await Settings.findOneAndUpdate(
      { _id: "global" },
      { $set: update },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getSettings, updateSettings };
