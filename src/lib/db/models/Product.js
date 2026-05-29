import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, trim: true, maxlength: 60 },
    options: { type: Map, of: String, default: {} },
    price: { type: Number, min: 0, max: 9999999, required: true }, // paise
    inventory: { type: Number, min: 0, max: 999999, default: 0 },
    weightGrams: { type: Number, min: 0, max: 500000, default: 0 },
    lowStockThreshold: { type: Number, min: 0, default: 5 },
    inLowStockState: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

const PersonalisationRuleSchema = new mongoose.Schema(
  {
    name: { type: String, enum: ["required", "optional", "hidden"], default: "optional" },
    school: { type: String, enum: ["required", "optional", "hidden"], default: "hidden" },
    fontSelector: { type: String, enum: ["enabled", "disabled"], default: "enabled" },
    additionalFee: { type: Number, min: 0, max: 999999, default: 0 }, // paise
  },
  { _id: false }
);

const TagSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 40 },
    color: {
      type: String,
      required: true,
      trim: true,
      match: /^#[0-9A-Fa-f]{6}$/,
    },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200, index: "text" },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 200,
      match: /^[a-z0-9-]+$/,
      index: true,
    },
    description: { type: String, maxlength: 50000, default: "" },

    // A product can belong to multiple categories (e.g. "School Book Labels"
    // appears under both Labels and School Essentials).
    categories: {
      type: [String],
      default: [],
      index: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one category is required",
      },
    },
    subcategories: { type: [String], default: [], index: true },

    badge: { type: String, maxlength: 40 },
    badgeStyle: { type: String, maxlength: 40 },

    // Pricing — all in paise.
    // `originalPrice` is the MRP / strike-through price.
    // `price` is the price the customer actually pays.
    // `discountPercent` is computed at save time from the two.
    price: { type: Number, min: 0, max: 9999999, required: true },
    originalPrice: { type: Number, min: 0, max: 9999999 },
    discountPercent: { type: Number, min: 0, max: 100, default: 0 },

    images: { type: [String], default: [] }, // CDN keys OR external URLs
    needsAssetMigration: { type: Boolean, default: false, index: true },

    variants: { type: [VariantSchema], default: [] },

    personalisation: { type: PersonalisationRuleSchema, default: () => ({}) },

    seo: {
      title: { type: String, maxlength: 70 },
      description: { type: String, maxlength: 160 },
      slug: { type: String, maxlength: 200 },
    },

    // Tagged labels with colour, e.g. { label: "Best Seller", color: "#FCD589" }.
    tags: { type: [TagSchema], default: [] },

    status: {
      type: String,
      enum: ["active", "draft", "archived"],
      default: "draft",
      index: true,
    },

    version: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Keep `category` (singular) accessible as a virtual for any existing code
// that still reads it — returns the first category in the array.
ProductSchema.virtual("category").get(function () {
  return this.categories?.[0];
});
ProductSchema.set("toJSON", { virtuals: true });
ProductSchema.set("toObject", { virtuals: true });

ProductSchema.pre("save", function (next) {
  if (!this.isNew) this.version += 1;

  // Recompute discountPercent so it stays consistent
  if (this.originalPrice && this.originalPrice > this.price) {
    this.discountPercent = Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100
    );
  } else {
    this.discountPercent = 0;
  }

  next();
});

// In Next.js dev, the module can be re-evaluated with a new schema while
// the previously-compiled model lingers in `mongoose.models`. That makes
// validation run against the stale schema. Force a recompile in dev so
// schema changes take effect without restarting the server.
if (process.env.NODE_ENV !== "production" && mongoose.models.Product) {
  mongoose.deleteModel("Product");
}

export const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);
