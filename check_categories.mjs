import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.local" });

const ProductSchema = new mongoose.Schema({
  categories: [String],
  subcategories: [String],
}, { strict: false });

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const p = await Product.findOne();
  console.log("categories:", p.categories);
  console.log("subcategories:", p.subcategories);
  process.exit(0);
}
main().catch(console.error);
