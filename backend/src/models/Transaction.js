const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user:            { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type:            { type: String, enum: ["credit", "debit", "reward", "withdrawal", "plan_purchase", "profit"], required: true },
    amount:          { type: Number, required: true, min: 0 },
    description:     { type: String, trim: true },
    status:          { type: String, enum: ["pending", "completed", "failed"], default: "completed" },
    reference:       { type: String, trim: true },
    plan:            { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
