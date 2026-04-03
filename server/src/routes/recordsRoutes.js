const express = require("express");
const router = express.Router();
const {
  getAllRecords,
  getRecordById,
  deleteRecord,
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

module.exports = router;
