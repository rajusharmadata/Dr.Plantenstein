const express = require("express");
const router = express.Router();

const { sendEmailOtp, verifyEmailOtp, completeProfile } = require("../controllers/authController");
const { requireOtpSession } = require("../middleware/requireOtpSession");

// OTP email auth (no Firebase / no Supabase)
router.post("/email/send-otp", sendEmailOtp);
router.post("/email/verify-otp", verifyEmailOtp);

// Completes profile after OTP verification.
// Expects otpSessionToken in Authorization header.
router.post("/email/complete-profile", requireOtpSession, completeProfile);

module.exports = router;

