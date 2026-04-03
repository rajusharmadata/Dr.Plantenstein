const jwt = require("jsonwebtoken");

/**
 * OTP session middleware.
 * Used for endpoints like "complete profile" where the user still needs to finish signup.
 *
 * Expects:
 *   Authorization: Bearer <otpSessionToken>
 *
 * Ensures:
 *   token payload.sessionType === "otp"
 */
const requireOtpSession = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Missing Authorization header." });
    }

    const token = authHeader.slice("Bearer ".length);
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res
        .status(500)
        .json({ success: false, message: "Server misconfigured: JWT_SECRET is missing." });
    }

    const payload = jwt.verify(token, secret);
    if (payload.sessionType !== "otp") {
      return res.status(403).json({ success: false, message: "OTP session required." });
    }

    req.user = {
      userId: payload.sub,
      email: payload.email,
      sessionType: payload.sessionType,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

module.exports = { requireOtpSession };

