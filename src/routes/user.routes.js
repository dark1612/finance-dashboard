const router = require("express").Router();
const { body } = require("express-validator");
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} = require("../controllers/user.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

// All user management routes require admin
router.use(protect, authorize("admin"));

router.get("/", getAllUsers);
router.get("/:id", getUserById);

router.patch(
  "/:id/role",
  [body("role").isIn(["viewer", "analyst", "admin"]).withMessage("Invalid role")],
  updateUserRole
);

router.patch(
  "/:id/status",
  [body("isActive").isBoolean().withMessage("isActive must be boolean")],
  updateUserStatus
);

router.delete("/:id", deleteUser);

module.exports = router;
