const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema(
  {
    // Owner of this scan record.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    cropName: {
      type: String,
      required: true,
      trim: true,
    },
    cropScientific: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["healthy", "warning", "critical", "severe", "soil"],
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    analysis: {
      description: String,
      remedies: String,
      prevention: [String],
      soilHealth: String,
    },
    scannedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Record", recordSchema);
