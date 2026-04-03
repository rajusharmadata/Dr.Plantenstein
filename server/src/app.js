const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const analyzeRoutes = require("./routes/analyzeRoutes");
const recordsRoutes = require("./routes/recordsRoutes");
const authRoutes = require("./routes/authRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

// ─── Security & Logging ──────────────────────────────────────────────────────
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ─── CORS: Allow requests from Expo Dev Server ────────────────────────────────
app.use(
  cors({
    origin: "*", // In production, restrict to your frontend domain
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Static Files (serve uploaded images) ────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🌿 Dr. Planteinstein API is healthy.",
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/analyze", analyzeRoutes);
app.use("/api/records", recordsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/weather", weatherRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
