import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { connectToDatabase } from "./src/lib/db/mongoose.js";
import { Product } from "./src/lib/db/models/Product.js";

async function run() {
  await connectToDatabase();

  // 1. Multi-category product
  const p1 = await Product.findOne({ slug: "permenant-ink-transfer-sticker-construction-trucks" }).lean();
  console.log("=== 3D Embossed Stickers - Construction Trucks ===");
  console.log("  title:", p1.title);
  console.log("  categories:", p1.categories);
  console.log("  subcategories:", p1.subcategories);
  console.log("  price (paise):", p1.price, "=", p1.price / 100, "INR");
  console.log("  originalPrice:", p1.originalPrice);
  console.log("  images count:", p1.images.length);
  console.log("  status:", p1.status);

  // 2. Product with compare-at price
  const p2 = await Product.findOne({ slug: /^back-to-school-label-set/ }).lean();
  console.log("\n=== Back To School Label Set ===");
  console.log("  title:", p2.title);
  console.log("  categories:", p2.categories);
  console.log("  subcategories:", p2.subcategories);
  console.log("  price (paise):", p2.price, "=", p2.price / 100, "INR");
  console.log("  originalPrice (paise):", p2.originalPrice, "=", p2.originalPrice / 100, "INR");
  console.log("  discountPercent:", p2.discountPercent);

  // 3. 2-level category product (Bags > Art bags)
  const p3 = await Product.findOne({ slug: /art-bag/ }).lean();
  console.log("\n=== Art Bag ===");
  console.log("  title:", p3.title);
  console.log("  categories:", p3.categories);
  console.log("  subcategories:", p3.subcategories);
  console.log("  images:", p3.images.length);

  // 4. Multi-image product
  const p4 = await Product.findOne({ slug: "3d-gift-tag-hibiscus" }).lean();
  console.log("\n=== 3D Gift Tag - Hibiscus ===");
  console.log("  images count:", p4.images.length);
  console.log("  images:", p4.images);

  // 5. Per-category counts
  const byCategory = await Product.aggregate([
    { $unwind: "$categories" },
    { $group: { _id: "$categories", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  console.log("\n=== Products per category ===");
  for (const c of byCategory) {
    console.log(" ", c._id, ":", c.count);
  }

  process.exit(0);
}
run();
