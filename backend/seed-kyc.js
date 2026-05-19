require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/marketminds";

const userSchema = new mongoose.Schema({
  name:       String,
  email:      { type: String, unique: true, lowercase: true },
  phone:      String,
  password:   String,
  isVerified: { type: Boolean, default: true },
  role:       { type: String, default: "user" },
  kycStatus:  { type: String, default: "none" },
  kycRejectionReason: String,
  kycSubmittedAt: Date,
  kycReviewedAt:  Date,
  bankDetails: {
    accountHolderName: String,
    accountNumber:     String,
    ifscCode:          String,
    bankName:          String,
    upiId:             String,
  },
}, { timestamps: true });

const USERS = [
  {
    name:  "Rahul Sharma",
    email: "rahul.sharma@example.com",
    phone: "9876543210",
    kycStatus: "pending",
    kycSubmittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    bankDetails: { accountHolderName: "Rahul Sharma", accountNumber: "012345678901", ifscCode: "HDFC0001234", bankName: "HDFC Bank", upiId: "rahul.sharma@hdfc" },
  },
  {
    name:  "Priya Mehta",
    email: "priya.mehta@example.com",
    phone: "9812345678",
    kycStatus: "pending",
    kycSubmittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    bankDetails: { accountHolderName: "Priya Mehta", accountNumber: "987654321098", ifscCode: "ICIC0002345", bankName: "ICICI Bank", upiId: "priya.mehta@icici" },
  },
  {
    name:  "Arjun Nair",
    email: "arjun.nair@example.com",
    phone: "9988776655",
    kycStatus: "pending",
    kycSubmittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    bankDetails: { accountHolderName: "Arjun Nair", accountNumber: "112233445566", ifscCode: "SBIN0003456", bankName: "State Bank of India", upiId: "arjun.nair@sbi" },
  },
  {
    name:  "Sneha Desai",
    email: "sneha.desai@example.com",
    phone: "9123456789",
    kycStatus: "approved",
    kycSubmittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    kycReviewedAt:  new Date(Date.now() - 9  * 24 * 60 * 60 * 1000),
    bankDetails: { accountHolderName: "Sneha Desai", accountNumber: "223344556677", ifscCode: "AXIS0004567", bankName: "Axis Bank", upiId: "sneha.desai@axisb" },
  },
  {
    name:  "Vikram Bose",
    email: "vikram.bose@example.com",
    phone: "9001122334",
    kycStatus: "rejected",
    kycRejectionReason: "Account number does not match the name provided. Please resubmit with correct details.",
    kycSubmittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    kycReviewedAt:  new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    bankDetails: { accountHolderName: "V. Bose", accountNumber: "334455667788", ifscCode: "KOTAK0005678", bankName: "Kotak Mahindra Bank", upiId: "vikram.bose@kotak" },
  },
  {
    name:  "Anita Reddy",
    email: "anita.reddy@example.com",
    phone: "9876001234",
    kycStatus: "none",
    bankDetails: null,
  },
];

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB:", MONGO_URI);

  const User = mongoose.models.User || mongoose.model("User", userSchema);
  const hashed = await bcrypt.hash("Test@1234", 12);

  let created = 0, skipped = 0;
  for (const u of USERS) {
    const exists = await User.findOne({ email: u.email });
    if (exists) { console.log(`  skip  ${u.email} (already exists)`); skipped++; continue; }
    await User.create({ ...u, password: hashed, isVerified: true });
    console.log(`  ✓ created  ${u.name} (${u.email})  [KYC: ${u.kycStatus}]`);
    created++;
  }

  console.log(`\nDone — ${created} created, ${skipped} skipped`);
  console.log("All test users have password: Test@1234\n");
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
