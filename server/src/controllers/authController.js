const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const User = require("../models/User");
const EmailOtp = require("../models/EmailOtp");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing.");
  return secret;
};

const getOtpHash = (email, otp) => {
  const salt = process.env.OTP_HASH_SALT || "dev_otp_salt";
  return crypto.createHash("sha256").update(`${email}${otp}${salt}`).digest("hex");
};

const getOtpExpiryDate = () => {
  const minutes = parseInt(process.env.OTP_EXPIRES_MINUTES || "10", 10);
  return new Date(Date.now() + minutes * 60 * 1000);
};

const buildMailer = () => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    throw new Error("SMTP env vars are missing (SMTP_HOST/PORT/USER/PASS/FROM).");
  }

  const port = parseInt(SMTP_PORT, 10);
  const secure = port === 465;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return { transporter, from: SMTP_FROM };
};

const signJwt = ({ userId, email, profileComplete, sessionType }) => {
  const jwtSecret = getJwtSecret();
  const expiresIn =
    sessionType === "otp"
      ? process.env.JWT_OTP_EXPIRES_IN || "30m"
      : process.env.JWT_EXPIRES_IN || "7d";

  return jwt.sign(
    {
      email,
      profileComplete,
      sessionType,
    },
    jwtSecret,
    { subject: userId.toString(), expiresIn }
  );
};

/**
 * POST /api/auth/email/send-otp
 * body: { email }
 */
const sendEmailOtp = async (req, res) => {
  try {
    const rawEmail = req.body?.email;
    if (!rawEmail || typeof rawEmail !== "string") {
      return res.status(400).json({ success: false, message: "Missing email." });
    }

    const email = rawEmail.trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format." });
    }

    const otp = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
    const otpHash = getOtpHash(email, otp);
    const expiresAt = getOtpExpiryDate();

    // Remove previous unused OTPs for this email to reduce confusion.
    await EmailOtp.deleteMany({ email });

    await EmailOtp.create({
      email,
      otpHash,
      expiresAt,
      usedAt: null,
    });

    const { transporter, from } = buildMailer();

    await transporter.sendMail({
      from,
      to: email,
      subject: "Dr. Planteinstein OTP Verification",
      text: `Your verification code is: ${otp}\n\nThis code expires in ${process.env.OTP_EXPIRES_MINUTES || "10"} minutes.`,
    });

    return res.status(200).json({ success: true, message: "OTP sent." });
  } catch (error) {
    console.error("sendEmailOtp error:", error);
    return res.status(500).json({ success: false, message: "Failed to send OTP." });
  }
};

/**
 * POST /api/auth/email/verify-otp
 * body: { email, otp }
 *
 * Returns:
 *  - if profileComplete => { token, user, profileComplete: true }
 *  - else               => { otpSessionToken, user, profileComplete: false }
 */
const verifyEmailOtp = async (req, res) => {
  try {
    const rawEmail = req.body?.email;
    const otp = req.body?.otp;

    if (!rawEmail || typeof rawEmail !== "string") {
      return res.status(400).json({ success: false, message: "Missing email." });
    }
    if (!otp || typeof otp !== "string") {
      return res.status(400).json({ success: false, message: "Missing otp." });
    }

    const email = rawEmail.trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format." });
    }
    if (!/^\d{6}$/.test(otp.trim())) {
      return res.status(400).json({ success: false, message: "OTP must be 6 digits." });
    }

    const otpDoc = await EmailOtp.findOne({
      email,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return res.status(400).json({ success: false, message: "OTP expired or invalid." });
    }

    const otpHash = getOtpHash(email, otp.trim());
    if (otpDoc.otpHash !== otpHash) {
      return res.status(400).json({ success: false, message: "OTP expired or invalid." });
    }

    otpDoc.usedAt = new Date();
    await otpDoc.save();

    const user = await User.findOneAndUpdate(
      { email },
      { $set: { emailVerified: true } },
      { new: true, upsert: true }
    );

    const profileComplete = Boolean(user.displayName && user.username);

    const userPayload = {
      id: user._id.toString(),
      email: user.email,
      displayName: user.displayName || "",
      username: user.username || "",
      emailVerified: user.emailVerified,
    };

    if (profileComplete) {
      const token = signJwt({
        userId: user._id,
        email: user.email,
        profileComplete: true,
        sessionType: "auth",
      });

      return res.status(200).json({
        success: true,
        token,
        user: userPayload,
        profileComplete: true,
      });
    }

    const otpSessionToken = signJwt({
      userId: user._id,
      email: user.email,
      profileComplete: false,
      sessionType: "otp",
    });

    return res.status(200).json({
      success: true,
      otpSessionToken,
      user: userPayload,
      profileComplete: false,
    });
  } catch (error) {
    console.error("verifyEmailOtp error:", error);
    return res.status(401).json({ success: false, message: "OTP verification failed." });
  }
};

/**
 * POST /api/auth/email/complete-profile
 * body: { displayName, username }
 * Header: Authorization: Bearer <otpSessionToken>
 */
const completeProfile = async (req, res) => {
  try {
    const displayName = (req.body?.displayName || "").trim();
    const username = (req.body?.username || "").trim();

    if (!displayName) {
      return res.status(400).json({ success: false, message: "Missing displayName." });
    }
    if (!username) {
      return res.status(400).json({ success: false, message: "Missing username." });
    }
    if (username.length < 3) {
      return res.status(400).json({ success: false, message: "Username too short." });
    }

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const normalizedUsername = username.toLowerCase();
    const existing = await User.findOne({ username: normalizedUsername, _id: { $ne: userId } });
    if (existing) {
      return res.status(409).json({ success: false, message: "Username already taken." });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          displayName,
          username: normalizedUsername,
          emailVerified: true,
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const token = signJwt({
      userId: user._id,
      email: user.email,
      profileComplete: true,
      sessionType: "auth",
    });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName || "",
        username: user.username || "",
        emailVerified: user.emailVerified,
      },
      profileComplete: true,
    });
  } catch (error) {
    console.error("completeProfile error:", error);
    return res.status(500).json({ success: false, message: "Failed to complete profile." });
  }
};

/**
 * GET /api/auth/profile
 * Header: Authorization: Bearer <token>
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName || "",
        username: user.username || "",
        phoneNumber: user.phoneNumber || "",
        isVerified: user.isVerified || false,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("getProfile error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch profile." });
  }
};

module.exports = { sendEmailOtp, verifyEmailOtp, completeProfile, getProfile };

