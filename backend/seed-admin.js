/**
 * Creates or promotes an admin user.
 * Usage:  node seed-admin.js
 *
 * Set MONGO_URI in .env or pass it as an env var:
 *   MONGO_URI=mongodb://localhost:27017/marketminds node seed-admin.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/marketminds";

const ADMIN_EMAIL    = "support.marketmind14@gmail.com";
const ADMIN_PASSWORD = "Aviraj@123";
const ADMIN_NAME     = "Admin";
const ADMIN_PHONE    = "9000000000";

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB:", MONGO_URI);

  // Inline schema so the script is self-contained
  const userSchema = new mongoose.Schema({
    name:       String,
    email:      { type: String, unique: true, lowercase: true },
    phone:      String,
    password:   String,
    isVerified: { type: Boolean, default: false },
    role:       { type: String, default: "user" },
    kycStatus:  { type: String, default: "none" },
  }, { timestamps: true });

  const User = mongoose.models.User || mongoose.model("User", userSchema);

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const existing = await User.findOne({ email: ADMIN_EMAIL });

  if (existing) {
    existing.role       = "admin";
    existing.isVerified = true;
    existing.password   = hashed;
    await existing.save();
    console.log("✓ Existing user promoted to admin:", ADMIN_EMAIL);
  } else {
    await User.create({
      name:       ADMIN_NAME,
      email:      ADMIN_EMAIL,
      phone:      ADMIN_PHONE,
      password:   hashed,
      isVerified: true,
      role:       "admin",
      kycStatus:  "approved",
    });
    console.log("✓ Admin user created:", ADMIN_EMAIL);
  }

  console.log("\nLogin credentials:");
  console.log("  Email:    ", ADMIN_EMAIL);
  console.log("  Password: ", ADMIN_PASSWORD);
  console.log("\nYou can change these at the top of seed-admin.js\n");

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
