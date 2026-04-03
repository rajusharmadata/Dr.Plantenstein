const Record = require("../models/Record");
const { analyzeImage } = require("../services/analysisService");
const path = require("path");

/**
 * POST /api/analyze
 * Accepts a multipart image upload, runs AI analysis, saves to DB, returns result.
 */
const analyzeLeaf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided." });
    }

    // Build a publicly accessible URL for the uploaded image
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    // Parse optional location from body
    const location = req.body.latitude && req.body.longitude
      ? {
          latitude: parseFloat(req.body.latitude),
          longitude: parseFloat(req.body.longitude),
          address: req.body.address || "",
        }
      : undefined;

    // Run the analysis engine
    const diagnosis = await analyzeImage(req.file.path);

    // Persist the result to MongoDB
    const record = await Record.create({
      ...diagnosis,
      imageUrl,
      location,
    });

    res.status(201).json({
      success: true,
      message: "Analysis complete.",
      data: record,
    });
  } catch (error) {
    console.error("analyzeLeaf error:", error);
    res.status(500).json({ success: false, message: "Server error during analysis." });
  }
};

module.exports = { analyzeLeaf };
