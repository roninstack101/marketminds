require("dotenv").config();
const mongoose = require("mongoose");
const Plan = require("./src/models/Plan");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/marketminds";

const PLANS = [
  {
    name: "Hyper Growth — Standard",
    tagline: "Standard Entry",
    description: "Begin your wealth journey with our algo-driven Hyper Growth strategy. Consistent monthly returns with full transparency.",
    minAmount: 50000,
    maxAmount: 99999,
    durationMonths: 12,
    expectedReturn: "3–5% monthly",
    features: [
      "Monthly profit distribution",
      "Real-time performance dashboard",
      "Dedicated support",
      "Transparent reporting",
    ],
    isActive: true,
    order: 1,
  },
  {
    name: "Hyper Growth — Premium",
    tagline: "Premium Entry",
    description: "Accelerate your capital with our high-conviction Hyper Growth strategy. Recommended for serious investors seeking aggressive compounding.",
    minAmount: 100000,
    durationMonths: 12,
    expectedReturn: "3–5% monthly",
    features: [
      "Priority allocation",
      "Monthly profit distribution",
      "Weekly performance updates",
      "Algo-driven rebalancing",
      "Dedicated account manager",
    ],
    isActive: true,
    order: 2,
  },
];

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB\n");

  for (const p of PLANS) {
    const exists = await Plan.findOne({ name: p.name });
    if (exists) {
      Object.assign(exists, p);
      await exists.save();
      console.log(`  ✓ updated  "${p.name}"`);
    } else {
      await Plan.create(p);
      console.log(`  ✓ created  "${p.name}"`);
    }
  }

  console.log("\nDone. Plans are live in the dashboard.\n");
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
