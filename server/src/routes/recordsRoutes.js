const express = require("express");
const router = express.Router();
const {
  getAllRecords,
  getRecordById,
  deleteRecord,
} = require("../controllers/recordsController");

/**
 * GET    /api/records        - Get all records (filterable, paginated)
 * GET    /api/records/:id    - Get a single record by ID
 * DELETE /api/records/:id    - Delete a record by ID
 */
router.get("/", getAllRecords);
router.get("/:id", getRecordById);
router.delete("/:id", deleteRecord);

module.exports = router;
