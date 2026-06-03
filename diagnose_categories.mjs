import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.local" });

const ProductSchema = new mongoose.Schema({
  title: String, slug: String, categories: [String], subcategories: [String],
}, { strict: false });

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  const testSlugs = [
    "back-to-school-label-set-african-safari-boy",  // should be in: combos, labels, school-essentials
    "permenant-ink-transfer-sticker-construction-trucks",  // should be in: labels, school-essentials
    "3d-embossed-stickers-combo-princess-unicorn",  // should be in: labels, school-essentials
  ];

  for (const slug of testSlugs) {
    const p = await Product.findOne({ slug }).lean();
    if (p) {
      console.log(`\n${slug}:`);
      console.log(`  categories:    [${p.categories.join(", ")}]`);
      console.log(`  subcategories: [${p.subcategories.join(", ")}]`);
    } else {
      console.log(`\n${slug}: NOT FOUND`);
    }
  }

  // Count multi-category products in DB
  const multiCat = await Product.find({
    "categories.1": { $exists: true }  // has at least 2 categories
  }).countDocuments();
  console.log(`\nProducts with 2+ categories in MongoDB: ${multiCat}`);

  // Count multi-subcategory products in DB
  const multiSub = await Product.find({
    "subcategories.1": { $exists: true }
  }).countDocuments();
  console.log(`Products with 2+ subcategories in MongoDB: ${multiSub}`);

  await mongoose.disconnect();
}

main().catch(console.error);
