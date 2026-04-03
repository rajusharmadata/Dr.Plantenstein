const Record = require("../models/Record");

/**
 * GET /api/records
 * Returns all scan records, newest first, with optional filtering by status.
 */
const getAllRecords = async (req, res) => {
  try {
    const filter = {};

    // Filter: ?status=healthy | warning | critical | severe | soil
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Pagination: ?page=1&limit=10
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      Record.find(filter).sort({ scannedAt: -1 }).skip(skip).limit(limit),
      Record.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: records,
    });
  } catch (error) {
    console.error("getAllRecords error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch records." });
  }
};

/**
 * GET /api/records/:id
 * Returns a single scan record by its MongoDB ID.
 */
const getRecordById = async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found." });
    }

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    console.error("getRecordById error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch record." });
  }
};

/**
 * DELETE /api/records/:id
 * Deletes a scan record by ID.
 */
const deleteRecord = async (req, res) => {
  try {
    const record = await Record.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found." });
    }

    res.status(200).json({ success: true, message: "Record deleted successfully." });
  } catch (error) {
    console.error("deleteRecord error:", error);
    res.status(500).json({ success: false, message: "Failed to delete record." });
  }
};

module.exports = { getAllRecords, getRecordById, deleteRecord };
