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

  const data = JSON.parse(fs.readFileSync("csv_updates.json", "utf-8"));
  
  let updatedCount = 0;
  let notFoundCount = 0;

  // We group updates by handle because multiple CSV rows might have the same handle
  // Wait, shopify CSVs have multiple rows for variants, all sharing the same Handle!
  // So we should merge categories for the same handle first.
  const handleMap = new Map();
  for (const item of data) {
    if (!handleMap.has(item.handle)) {
      handleMap.set(item.handle, { categories: new Set(), subcategories: new Set() });
    }
    const entry = handleMap.get(item.handle);
    item.categories.forEach(c => entry.categories.add(c));
    item.subcategories.forEach(s => entry.subcategories.add(s));
  }

  console.log(`Processing ${handleMap.size} unique products...`);

  for (const [handle, entry] of handleMap.entries()) {
    const updated = await Product.findOneAndUpdate(
      { slug: handle },
      { 
        $set: { 
          categories: Array.from(entry.categories),
          subcategories: Array.from(entry.subcategories) 
        } 
      },
      { new: true }
    );

    if (updated) {
      updatedCount++;
    } else {
      notFoundCount++;
    }
  }

  console.log("\nSummary:");
  console.log(`- Updated: ${updatedCount} products`);
  console.log(`- Not Found in DB: ${notFoundCount} products`);

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch(console.error);
