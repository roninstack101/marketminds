const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    _id:                 { type: String, default: "global" },
    paymentQrCode:       { type: String },
    paymentInstructions: { type: String },
    paymentEmail:        { type: String },
    paymentUpiId:        { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
