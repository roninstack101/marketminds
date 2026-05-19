require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/marketminds";
const EMAIL    = "support.marketmind14@gmail.com";
const PASSWORD = "Aviraj@123";

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected");

  let user = await User.findOne({ email: EMAIL });

  if (user) {
    user.password   = PASSWORD;   // pre-save hook will hash it
    user.role       = "admin";
    user.isVerified = true;
    await user.save();
    console.log("✓ Password reset and role set to admin for:", EMAIL);
  } else {
    user = await User.create({
      name: "Admin",
      email: EMAIL,
      phone: "9000000000",
      password: PASSWORD,         // pre-save hook will hash it
      isVerified: true,
      role: "admin",
      kycStatus: "approved",
    });
    console.log("✓ Admin created:", EMAIL);
  }

  await mongoose.disconnect();
  console.log("\nLogin with:");
  console.log("  Email:   ", EMAIL);
  console.log("  Password:", PASSWORD);
}

main().catch(err => { console.error(err); process.exit(1); });
