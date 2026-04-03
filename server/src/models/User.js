const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Email is the login identifier.
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    emailVerified: { type: Boolean, default: false },

    // Profile fields (required after OTP verification).
    displayName: { type: String, required: false, trim: true },
    phoneNumber: { type: String, required: false, trim: true },
    isVerified: { type: Boolean, default: true },
    username: {
      type: String,
      required: false,
      unique: true,
      sparse: true, // allows null/undefined until profile is completed
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

