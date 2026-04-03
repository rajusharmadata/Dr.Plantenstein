const cloudinary = require("cloudinary").v2;

// Configure Cloudinary once at startup using environment variables.
// Required env vars (support both naming styles):
//   - CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET
//   - CLOUDINARY_NAME / CLOUDINARY_KEY / CLOUDINARY_SECRET (legacy from your current .env)
// Optional env vars:
//   - CLOUDINARY_FOLDER (default: "plantenstein")
const cloudName =
  process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY;
const apiSecret =
  process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET;

const isConfigured = Boolean(cloudName) && Boolean(apiKey) && Boolean(apiSecret);

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
} else {
  // Cloudinary upload will be skipped in controllers when not configured.
  console.warn(
    "Cloudinary not configured: missing CLOUDINARY_* env vars. Backend will fall back to local /uploads hosting."
  );
}

module.exports = cloudinary;

