const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const bankDetailSchema = new mongoose.Schema(
  {
    accountHolderName: { type: String, trim: true },
    accountNumber:     { type: String, trim: true },
    ifscCode:          { type: String, trim: true, uppercase: true },
    bankName:          { type: String, trim: true },
    upiId:             { type: String, trim: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    isVerified: { type: Boolean, default: false },
    role:       { type: String, enum: ["user", "admin"], default: "user" },
    bankDetails: { type: bankDetailSchema, default: null },
    kycStatus:          { type: String, enum: ["none", "pending", "approved", "rejected"], default: "none" },
    kycRejectionReason: { type: String },
    kycSubmittedAt:     { type: Date },
    kycReviewedAt:      { type: Date },
    referralGroup:      { type: String, enum: ["vishal", "bablu"], default: null },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("User", userSchema);
