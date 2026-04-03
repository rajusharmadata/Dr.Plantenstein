const Record = require("../models/Record");
const { analyzeImage } = require("../services/analysisService");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");

/**
 * POST /api/analyze
 * Accepts a multipart image upload, runs AI analysis, saves to DB, returns result.
 */
const analyzeLeaf = async (req, res) => {
  const localFilePath = req.file?.path;
  let shouldDeleteLocalFile = false;

  try {
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided." });
    }

    // Cloudinary upload is now the PRIMARY method.
    let imageUrl = null;
    const cloudinaryConfigured =
      Boolean(process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME) &&
      Boolean(process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY) &&
      Boolean(process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET);

    if (cloudinaryConfigured) {
      const folder = process.env.CLOUDINARY_FOLDER || "plantenstein";
      try {
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
          folder,
          resource_type: "image",
        });

        if (uploadResult?.secure_url) {
          imageUrl = uploadResult.secure_url;
          shouldDeleteLocalFile = true;
          console.log("Cloudinary upload successful:", imageUrl);
        }
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError.message);
      }
    }

    // Fallback ONLY if Cloudinary failed or is not configured.
    if (!imageUrl) {
      imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      console.warn("Falling back to local static hosting for image:", imageUrl);
    }

    // Parse optional location from body
    const location = req.body.latitude && req.body.longitude
      ? {
          latitude: parseFloat(req.body.latitude),
          longitude: parseFloat(req.body.longitude),
          address: req.body.address || "",
        }
      : undefined;

    // Run the analysis engine
    const diagnosis = await analyzeImage(localFilePath);

    // Persist the result to MongoDB
    const record = await Record.create({
      ...diagnosis,
      imageUrl,
      location,
      userId: req.user?.userId,
    });

    res.status(201).json({
      success: true,
      message: "Analysis complete.",
      data: record,
    });
  } catch (error) {
    console.error("analyzeLeaf error:", error);

    // If something failed after multer saved the file, clean up the local temp upload.
    if (localFilePath) {
      try {
        await fs.promises.unlink(localFilePath);
      } catch {
        // Ignore cleanup errors; the main goal is returning a proper API response.
      }
    }

    res.status(500).json({ success: false, message: "Server error during analysis." });
  } finally {
    // If we successfully stored the image in Cloudinary, we no longer need the local copy.
    // (We delete only in the success-path where Cloudinary secure_url was used.)
    if (shouldDeleteLocalFile && localFilePath) {
      try {
        await fs.promises.unlink(localFilePath);
      } catch {
        // Ignore cleanup errors.
      }
    }
  }
};

module.exports = { analyzeLeaf };
