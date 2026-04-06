const router = require("express").Router();
const { body } = require("express-validator");
const {
  getRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
} = require("../controllers/record.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

const recordValidation = [
  body("amount").isFloat({ min: 0.01 }).withMessage("Amount must be a positive number"),
  body("type").isIn(["income", "expense"]).withMessage("Type must be income or expense"),
  body("category")
    .isIn(["salary", "investment", "freelance", "food", "transport", "utilities", "entertainment", "healthcare", "education", "other"])
    .withMessage("Invalid category"),
  body("date").optional().isISO8601().withMessage("Invalid date format"),
  body("notes").optional().isLength({ max: 500 }).withMessage("Notes too long"),
];

// All authenticated users can view
router.get("/", protect, authorize("viewer", "analyst", "admin"), getRecords);
router.get("/:id", protect, authorize("viewer", "analyst", "admin"), getRecordById);

// Only admin can write
router.post("/", protect, authorize("admin"), recordValidation, createRecord);
router.put("/:id", protect, authorize("admin"), recordValidation, updateRecord);
router.delete("/:id", protect, authorize("admin"), deleteRecord);

module.exports = router;
