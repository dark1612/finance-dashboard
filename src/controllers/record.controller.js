const { validationResult } = require("express-validator");
const Record = require("../models/record.model");
const { asyncHandler } = require("../middleware/error.middleware");

// GET /api/records  [viewer, analyst, admin]
// Query params: type, category, startDate, endDate, page, limit
const getRecords = asyncHandler(async (req, res) => {
  const { type, category, startDate, endDate, page = 1, limit = 10 } = req.query;

  const filter = {};

  if (type) filter.type = type;
  if (category) filter.category = category;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Record.countDocuments(filter);

  const records = await Record.find(filter)
    .populate("createdBy", "name email")
    .sort({ date: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    records,
  });
});

// GET /api/records/:id  [viewer, analyst, admin]
const getRecordById = asyncHandler(async (req, res) => {
  const record = await Record.findById(req.params.id).populate("createdBy", "name email");
  if (!record) {
    return res.status(404).json({ success: false, message: "Record not found" });
  }
  res.json({ success: true, record });
});

// POST /api/records  [admin only]
const createRecord = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const record = await Record.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, record });
});

// PUT /api/records/:id  [admin only]
const updateRecord = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  // Disallow changing createdBy
  delete req.body.createdBy;
  delete req.body.isDeleted;

  const record = await Record.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!record) {
    return res.status(404).json({ success: false, message: "Record not found" });
  }

  res.json({ success: true, record });
});

// DELETE /api/records/:id  [admin only] — soft delete
const deleteRecord = asyncHandler(async (req, res) => {
  // Bypass the soft-delete pre-query hook to find the actual doc
  const record = await Record.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

  if (!record) {
    return res.status(404).json({ success: false, message: "Record not found" });
  }

  res.json({ success: true, message: "Record deleted (soft)" });
});

module.exports = { getRecords, getRecordById, createRecord, updateRecord, deleteRecord };
