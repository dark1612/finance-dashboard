const mongoose = require("mongoose");

const TYPES = ["income", "expense"];
const CATEGORIES = [
  "salary",
  "investment",
  "freelance",
  "food",
  "transport",
  "utilities",
  "entertainment",
  "healthcare",
  "education",
  "other",
];

const recordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be positive"],
    },
    type: {
      type: String,
      enum: TYPES,
      required: [true, "Type (income/expense) is required"],
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, "Category is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false, // Soft delete
    },
  },
  { timestamps: true }
);

// Exclude soft-deleted records from all queries by default
recordSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

module.exports = mongoose.model("Record", recordSchema);
