const jwt = require("jsonwebtoken");

/**
 * JWT auth middleware.
 * Expects: Authorization: Bearer <token>
 *
 * On success:
 *   req.user = { userId, email, profileComplete }
 */
const requireAuth = (req, res, next) => {
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
    req.user = {
      userId: payload.sub,
      email: payload.email,
      profileComplete: payload.profileComplete === true,
    };

    if (!req.user.profileComplete) {
      return res
        .status(403)
        .json({ success: false, message: "Complete your profile to continue." });
    }

    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

module.exports = { requireAuth };

