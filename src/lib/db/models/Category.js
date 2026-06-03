import mongoose from "mongoose";

const SubcategorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 100,
      match: /^[a-z0-9-]+$/,
    },
    image: { type: String, trim: true },
    circleImage: { type: String, trim: true },
  },
  { _id: true }
);

const CategorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 100,
      match: /^[a-z0-9-]+$/,
      index: true,
    },
    description: { type: String, required: true },
    tagline: { type: String },
    image: { type: String, required: true },
    featured: { type: Boolean, default: false, index: true },
    subcategories: { type: [SubcategorySchema], default: [] },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production" && mongoose.models.Category) {
  mongoose.deleteModel("Category");
}

export const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
