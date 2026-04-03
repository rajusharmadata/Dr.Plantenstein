const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const { analyzeLeaf } = require("../controllers/analyzeController");

/**
 * POST /api/analyze
 * Upload a leaf image for disease analysis. Uses multer to handle the file.
 */
router.post("/", upload.single("image"), analyzeLeaf);

module.exports = router;
