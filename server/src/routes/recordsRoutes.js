const express = require("express");
const router = express.Router();
const {
  getAllRecords,
  getRecordById,
  deleteRecord,
  addChatMessage,
  addVoiceChatMessage,
} = require("../controllers/recordsController");
const { requireAuth } = require("../middleware/requireAuth");

/**
 * GET    /api/records        - Get all records (filterable, paginated)
 * GET    /api/records/:id    - Get a single record by ID
 * DELETE /api/records/:id    - Delete a record by ID
 */
router.get("/", requireAuth, getAllRecords);
router.get("/:id", requireAuth, getRecordById);
router.delete("/:id", requireAuth, deleteRecord);

const upload = require("../config/multer");

// Add follow-up question via Gemini
router.post("/:id/chat", requireAuth, addChatMessage);

// Add follow-up question via Voice (Gemini multimodal)
router.post("/:id/voice-chat", requireAuth, upload.single("audio"), addVoiceChatMessage);

module.exports = router;
