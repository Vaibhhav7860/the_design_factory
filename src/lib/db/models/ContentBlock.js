import mongoose from "mongoose";

/**
 * Generic content block — one document per Storefront homepage section.
 * The `key` identifies which section it represents (hero, banner, seasons-picks, etc.)
 * and `data` is the section-specific JSON payload.
 */
const ContentBlockSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    title: String, // human label
    isVisible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    version: { type: Number, default: 0 },
    isInvalid: { type: Boolean, default: false }, // true if a referenced product was archived
    invalidReason: String,
  },
  { timestamps: true }
);

ContentBlockSchema.pre("save", function (next) {
  if (!this.isNew) this.version += 1;
  next();
});

export const ContentBlock =
  mongoose.models.ContentBlock || mongoose.model("ContentBlock", ContentBlockSchema);

const PageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9-]+$/, index: true },
    body: { type: String, default: "" },
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft", index: true },
    seo: {
      title: String,
      description: String,
    },
    featuredImage: String,
    publishedAt: Date,
  },
  { timestamps: true }
);

export const Page = mongoose.models.Page || mongoose.model("Page", PageSchema);

const NavigationMenuSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true }, // 'main-header' | 'footer'
    title: String,
    items: { type: mongoose.Schema.Types.Mixed, default: [] },
    version: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const NavigationMenu =
  mongoose.models.NavigationMenu || mongoose.model("NavigationMenu", NavigationMenuSchema);
