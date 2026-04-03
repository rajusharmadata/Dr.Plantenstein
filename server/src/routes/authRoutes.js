const express = require("express");
const router = express.Router();

const { sendEmailOtp, verifyEmailOtp, completeProfile, getProfile } = require("../controllers/authController");
const { requireOtpSession } = require("../middleware/requireOtpSession");
const { requireAuth } = require("../middleware/requireAuth");

// OTP email auth (no Firebase / no Supabase)
router.post("/email/send-otp", sendEmailOtp);
router.post("/email/verify-otp", verifyEmailOtp);

// Completes profile after OTP verification.
// Expects otpSessionToken in Authorization header.
router.post("/email/complete-profile", requireOtpSession, completeProfile);

// Get current user profile.
// Expects auth token in Authorization header.
router.get("/profile", requireAuth, getProfile);

module.exports = router;

