require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const User     = require("./src/models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/marketminds";
const EMAIL    = "support.marketmind14@gmail.com";
const PASSWORD = "Aviraj@123";

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected\n");

  // Find with password field included
  const user = await User.findOne({ email: EMAIL }).select("+password");

  if (!user) {
    console.log("❌ User NOT found in DB with email:", EMAIL);
    console.log("   All users in DB:");
    const all = await User.find({}, "email role isVerified");
    all.forEach(u => console.log("  -", u.email, `[role: ${u.role}, verified: ${u.isVerified}]`));
    await mongoose.disconnect(); return;
  }

  console.log("✓ User found:");
  console.log("  email:      ", user.email);
  console.log("  role:       ", user.role);
  console.log("  isVerified: ", user.isVerified);
  console.log("  passwordHash:", user.password?.slice(0, 20), "...");

  const match = await bcrypt.compare(PASSWORD, user.password);
  console.log("\n  Password match:", match ? "✓ YES" : "❌ NO");

  if (!match) {
    console.log("\n  Re-hashing and saving correct password...");
    user.password   = PASSWORD;
    user.isVerified = true;
    user.role       = "admin";
    await user.save();
    const recheck = await User.findOne({ email: EMAIL }).select("+password");
    const match2  = await bcrypt.compare(PASSWORD, recheck.password);
    console.log("  After fix, match:", match2 ? "✓ YES — try logging in now" : "❌ Still failing");
  }

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
