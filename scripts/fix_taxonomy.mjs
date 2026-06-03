import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function fixTaxonomy() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    // 1. Fix the typo "organsiers" -> "organisers" in categories
    const updateCats = await db.collection('products').updateMany(
      { categories: "organsiers" },
      { $set: { "categories.$": "organisers" } }
    );
    console.log(`Fixed typo in categories (organsiers -> organisers): ${updateCats.modifiedCount} products updated`);

    // 2. Fix Adults Corner subcategories
    const adultsMapping = {
      "flat-gift-tags": "flat-gift-tags-adults",
      "3d-gift-tags": "3d-gift-tags-adults",
      "money-envelopes": "money-envelopes-adults",
      "bag-tags": "bag-tags-adults",
      "towels": "towels-adults",
      "towel": "towels-adults", // just in case
      "gift-stationery-combo": "gift-stationery-combo-adults"
    };

    let adultsFixed = 0;
    const adultsProducts = await db.collection('products').find({ categories: "adults-corner" }).toArray();
    
    for (const p of adultsProducts) {
      if (!p.subcategories || p.subcategories.length === 0) continue;
      
      let modified = false;
      const newSubcats = p.subcategories.map(sub => {
        if (adultsMapping[sub]) {
          modified = true;
          return adultsMapping[sub];
        }
        return sub;
      });

      if (modified) {
        await db.collection('products').updateOne(
          { _id: p._id },
          { $set: { subcategories: newSubcats } }
        );
        adultsFixed++;
      }
    }
    
    console.log(`Fixed subcategory slugs for ${adultsFixed} products in adults-corner.`);

    // 3. Fix labels / school essentials
    // "iron-on-labels-clothes" vs "iron-on-labels"
    // The CSV might have had "iron-on-labels-for-clothes"
    const labelsFixed = await db.collection('products').updateMany(
      { subcategories: "iron-on-labels-for-clothes" },
      { $set: { "subcategories.$": "iron-on-labels-clothes" } }
    );
    console.log(`Fixed iron-on-labels subcategories: ${labelsFixed.modifiedCount} products updated`);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

fixTaxonomy();
