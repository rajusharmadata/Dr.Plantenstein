const Post = require("../models/Post");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

/**
 * POST /api/community/posts
 * Create a new community post with optional images and location.
 */
const createPost = async (req, res) => {
  const files = req.files || [];
  const imageUrls = [];

  try {
    const { content, category, latitude, longitude, address } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: "Content is required." });
    }

    // 1. Upload all provided images to Cloudinary
    for (const file of files) {
      try {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "plantenstein/community",
          resource_type: "image",
        });
        if (uploadResult?.secure_url) {
          imageUrls.push(uploadResult.secure_url);
        }
        // Clean up local temp file
        fs.unlink(file.path, () => {});
      } catch (err) {
        console.error("Cloudinary upload error in post:", err.message);
      }
    }

    // 2. Prepare location object if available
    const location = latitude && longitude 
      ? { latitude: parseFloat(latitude), longitude: parseFloat(longitude), address } 
      : undefined;

    // 3. Create the record in MongoDB
    const post = await Post.create({
      userId: req.user?.userId,
      content,
      category,
      location,
      images: imageUrls,
    });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error("createPost error:", error);
    // Cleanup any lingering temp files
    files.forEach(f => fs.unlink(f.path, () => {}));
    res.status(500).json({ success: false, message: "Failed to create post." });
  }
};

/**
 * GET /api/community/posts
 * Fetch the social feed, optionally filtered by category.
 */
const getPosts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category && category !== "All" ? { category } : {};

    const posts = await Post.find(filter)
      .populate("userId", "displayName username") // Populate poster info
      .sort({ createdAt: -1 })
      .limit(50); // Standard feed limit

    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    console.error("getPosts error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch feed." });
  }
};

module.exports = { createPost, getPosts };
