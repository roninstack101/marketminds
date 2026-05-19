const mongoose = require("mongoose");

const dashboardDataSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    stats:       { type: mongoose.Schema.Types.Mixed },  // flexible JSON for admin to push any metrics
    isActive:    { type: Boolean, default: true },
    updatedBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DashboardData", dashboardDataSchema);
