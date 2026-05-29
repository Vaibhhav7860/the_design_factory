import mongoose from "mongoose";

const DiscountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    type: {
      type: String,
      enum: ["percentage", "fixed", "free_shipping", "bxgy"],
      required: true,
    },
    value: { type: Number, default: 0 }, // percent (0–100) or paise depending on type
    bxgyConfig: {
      buyQuantity: Number,
      getQuantity: Number,
      getDiscountPercent: Number,
    },

    scope: {
      kind: { type: String, enum: ["all", "products", "categories"], default: "all" },
      productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
      categories: [String],
    },

    minSubtotal: { type: Number, default: 0 }, // paise

    customerEligibility: {
      kind: { type: String, enum: ["all", "tags"], default: "all" },
      tags: [String],
    },

    usageLimits: {
      total: Number,
      perCustomer: Number,
    },
    usedCount: { type: Number, default: 0 },

    startsAt: Date,
    endsAt: Date,

    isActive: { type: Boolean, default: true, index: true },
    isArchived: { type: Boolean, default: false, index: true },

    coupons: [
      {
        code: { type: String, uppercase: true, trim: true },
      },
    ],
  },
  { timestamps: true }
);

DiscountSchema.index({ "coupons.code": 1 }, { unique: true, sparse: true });

export const Discount =
  mongoose.models.Discount || mongoose.model("Discount", DiscountSchema);
