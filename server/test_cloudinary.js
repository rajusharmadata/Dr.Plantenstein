require("dotenv").config();
const cloudinary = require("cloudinary").v2;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET;

console.log("------------------------------------------");
console.log("☁️  Cloudinary Connectivity Test");
console.log(`Cloud Name: ${cloudName}`);
console.log(`API Key:    ${apiKey ? "****" + apiKey.slice(-4) : "MISSING"}`);
console.log(`API Secret: ${apiSecret ? "****" + apiSecret.slice(-4) : "MISSING"}`);
console.log("------------------------------------------");

if (!cloudName || !apiKey || !apiSecret) {
  console.error("❌ Missing configuration in .env.");
  process.exit(1);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

async function runTest() {
  try {
    console.log("⏳ Attempting to ping Cloudinary API...");
    // The simplest way to test is to query the api for account details (requires admin rights)
    // or just try a dummy upload with a small base64 string.
    const result = await cloudinary.uploader.upload("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", {
      folder: "test_connection",
    });

    console.log("✅ SUCCESS! Cloudinary is connected and working.");
    console.log("Public URL:", result.secure_url);
    process.exit(0);
  } catch (error) {
    console.error("❌ CLOUDINARY ERROR:", error.message);
    if (error.message.includes("Invalid cloud_name")) {
      console.error("\n💡 TIP: Cloud Names are usually randomly generated strings (e.g., 'dcyy7umsc'). 'root' is very unlikely unless you specifically set it up that way in your dashboard settings.");
    }
    process.exit(1);
  }
}

runTest();
