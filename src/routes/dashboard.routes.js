const router = require("express").Router();
const {
  getSummary,
  getByCategory,
  getMonthlyTrends,
  getRecentActivity,
} = require("../controllers/dashboard.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

// Recent activity: all roles can see
router.get("/recent", protect, authorize("viewer", "analyst", "admin"), getRecentActivity);

// Analytics: analyst and admin only
router.get("/summary", protect, authorize("analyst", "admin"), getSummary);
router.get("/by-category", protect, authorize("analyst", "admin"), getByCategory);
router.get("/monthly-trends", protect, authorize("analyst", "admin"), getMonthlyTrends);

module.exports = router;
