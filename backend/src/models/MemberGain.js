const mongoose = require("mongoose");

const memberGainSchema = new mongoose.Schema(
  {
    memberName:       { type: String, required: true, trim: true },
    invested:         { type: Number, required: true, min: 0 },
    currentValue:     { type: Number, required: true, min: 0 },
    totalReturnPct:   { type: Number, required: true },
    monthlyReturnPct: { type: Number, required: true },
    isPublished:      { type: Boolean, default: false },
    publishedAt:      { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MemberGain", memberGainSchema);
