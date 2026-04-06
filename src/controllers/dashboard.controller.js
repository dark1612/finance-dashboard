const Record = require("../models/record.model");
const { asyncHandler } = require("../middleware/error.middleware");

// GET /api/dashboard/summary  [analyst, admin]
const getSummary = asyncHandler(async (req, res) => {
  const result = await Record.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  let totalIncome = 0, totalExpenses = 0, incomeCount = 0, expenseCount = 0;

  result.forEach((r) => {
    if (r._id === "income") { totalIncome = r.total; incomeCount = r.count; }
    if (r._id === "expense") { totalExpenses = r.total; expenseCount = r.count; }
  });

  res.json({
    success: true,
    summary: {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      incomeCount,
      expenseCount,
    },
  });
});

// GET /api/dashboard/by-category  [analyst, admin]
const getByCategory = asyncHandler(async (req, res) => {
  const { type } = req.query; // optional filter by type
  const match = { isDeleted: false };
  if (type) match.type = type;

  const result = await Record.aggregate([
    { $match: match },
    {
      $group: {
        _id: { category: "$category", type: "$type" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);

  res.json({ success: true, breakdown: result });
});

// GET /api/dashboard/monthly-trends  [analyst, admin]
// Query param: year (default: current year)
const getMonthlyTrends = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();

  const result = await Record.aggregate([
    {
      $match: {
        isDeleted: false,
        date: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: "$date" }, type: "$type" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.month": 1 } },
  ]);

  // Shape into a cleaner month-keyed object
  const months = {};
  result.forEach(({ _id: { month, type }, total, count }) => {
    if (!months[month]) months[month] = { month, income: 0, expense: 0 };
    months[month][type] = total;
  });

  res.json({
    success: true,
    year,
    trends: Object.values(months),
  });
});

// GET /api/dashboard/recent  [viewer, analyst, admin]
const getRecentActivity = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const records = await Record.find()
    .populate("createdBy", "name")
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json({ success: true, records });
});

module.exports = { getSummary, getByCategory, getMonthlyTrends, getRecentActivity };
