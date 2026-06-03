import fs from "fs";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.local" });

const ProductSchema = new mongoose.Schema({
  title: String,
  slug: String,
  categories: [String],
  subcategories: [String],
}, { strict: false });

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  const data = JSON.parse(fs.readFileSync("csv_updates_v2.json", "utf-8"));

  let updatedCount = 0;
  let clearedCount = 0;
  let notFoundCount = 0;
  let notFoundSlugs = [];

  console.log(`Processing ${data.length} products from CSV...`);

  for (const item of data) {
    const result = await Product.findOneAndUpdate(
      { slug: item.handle },
      {
        $set: {
          categories: item.categories,
          subcategories: item.subcategories,
        },
      },
      { new: true }
    );

    if (result) {
      if (item.is_festival_only) {
        clearedCount++;
      } else {
        updatedCount++;
      }
    } else {
      notFoundCount++;
      notFoundSlugs.push(item.handle);
    }
  }

  console.log("\n=== SUMMARY ===");
  console.log(`Updated (correct categories set): ${updatedCount}`);
  console.log(`Cleared (festival-only, categories emptied): ${clearedCount}`);
  console.log(`Not found in DB: ${notFoundCount}`);

  if (notFoundSlugs.length > 0 && notFoundSlugs.length <= 30) {
    console.log("\nNot found slugs:");
    notFoundSlugs.forEach((s) => console.log(`  ${s}`));
  }

  // Verification: check cap subcategory
  const capProducts = await Product.find({ subcategories: "cap" }).lean();
  console.log(`\n=== VERIFICATION: Products with 'cap' subcategory: ${capProducts.length} ===`);
  for (const p of capProducts) {
    console.log(`  ${p.slug} | cats: ${p.categories} | subcats: ${p.subcategories}`);
  }

  // Verify festival products are cleared
  const rakhiInKids = await Product.find({
    slug: /rakhi/i,
    categories: "kids-accessories",
  }).lean();
  console.log(`\n=== VERIFICATION: Rakhi products still in kids-accessories: ${rakhiInKids.length} ===`);
  for (const p of rakhiInKids) {
    console.log(`  ${p.slug} | cats: ${p.categories} | subcats: ${p.subcategories}`);
  }

  await mongoose.disconnect();
  console.log("\nDone.");
}

main().catch(console.error);
