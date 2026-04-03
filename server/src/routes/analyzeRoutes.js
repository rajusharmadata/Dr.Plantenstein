const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const { analyzeLeaf } = require("../controllers/analyzeController");
const { requireAuth } = require("../middleware/requireAuth");

/**
 * POST /api/analyze
 * Upload a leaf image for disease analysis. Uses multer to handle the file.
 */
// Require JWT before allowing scans/uploads.
router.post("/", requireAuth, upload.single("image"), analyzeLeaf);

module.exports = router;
