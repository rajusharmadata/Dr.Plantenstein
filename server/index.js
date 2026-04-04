require("dotenv").config();
const fs = require("fs");
const path = require("path");

const app = require("./src/app");
const connectDB = require("./src/config/database");

// ─── Ensure uploads directory exists ─────────────────────────────────────────
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 Created uploads/ directory.");
}

// ─── Connect to MongoDB then start server ─────────────────────────────────────
const PORT = process.env.PORT || 3000;

const start = async () => {
  await connectDB();

  const HOST = "0.0.0.0";
  app.listen(PORT, HOST, () => {
    console.log(`
🌿 ─────────────────────────────────────────────────────────
   Dr. Planteinstein API Server
   Local Network: http://192.168.31.68:${PORT}/api
   Localhost: http://localhost:${PORT}
   Environment: ${process.env.NODE_ENV || "development"}
🌿 ─────────────────────────────────────────────────────────
    `);
  });
};

start();
