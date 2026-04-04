const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // The main text content of the post
    content: {
      type: String,
      required: true,
      trim: true,
    },
    // Array of Cloudinary image URLs
    images: [
      {
        type: String,
      },
    ],
    // Classification (e.g., Cereals, Vegetables, etc.)
    category: {
      type: String,
      enum: ["Cereals", "Vegetables", "Fruits", "Other"],
      default: "Other",
      index: true,
    },
    // Optional location data
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    // Social interaction basics
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    // Optional diagnosis info from the AI
    diagnosis: {
      title: String,
      status: String,
      confidence: Number,
    },
    // New fields for Farmer's Guild UI
    type: {
      type: String,
      enum: ["post", "scan_analysis", "question"],
      default: "post",
    },
    remedy: String,
    precaution: String,
    authorRole: String, // e.g. "FARMERS GROUP"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
