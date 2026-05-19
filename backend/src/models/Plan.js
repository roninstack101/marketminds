const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    name:           { type: String, required: true, trim: true },
    tagline:        { type: String, trim: true },
    description:    { type: String, trim: true },
    minAmount:      { type: Number, required: true, min: 500 },
    maxAmount:      { type: Number },
    durationMonths: { type: Number, required: true, min: 1 },
    expectedReturn: { type: String },
    features:       [{ type: String }],
    isActive:       { type: Boolean, default: true },
    order:          { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);
