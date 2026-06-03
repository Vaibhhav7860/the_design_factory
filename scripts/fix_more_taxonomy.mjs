import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function fixMoreTaxonomy() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    // Fix combos mapping
    const combosMapping = {
      "back-to-school-set": "back-to-school-label-set",
      "gift-stationery-combo": "gift-stationery-combo-kids", // default to kids
      "bag-set-combos": "bag-combo-set",
      "school-bag-and-combos": "school-bag-combo"
    };

    let combosFixed = 0;
    const combosProducts = await db.collection('products').find({ categories: "combos" }).toArray();
    
    for (const p of combosProducts) {
      if (!p.subcategories || p.subcategories.length === 0) continue;
      
      let modified = false;
      const newSubcats = p.subcategories.map(sub => {
        if (combosMapping[sub]) {
          modified = true;
          return combosMapping[sub];
        }
        return sub;
      });

      // Filter out 'kids' since gift-stationery-combo-kids handles it
      const filtered = newSubcats.filter(s => s !== "kids");
      if (filtered.length !== newSubcats.length) modified = true;

      if (modified) {
        await db.collection('products').updateOne(
          { _id: p._id },
          { $set: { subcategories: filtered } }
        );
        combosFixed++;
      }
    }
    
    console.log(`Fixed subcategory slugs for ${combosFixed} products in combos.`);

    // One more check: gift-stationery category has gift-stationery-sets
    // In DB, it's gift-stationery-combo
    const gsMapping = {
      "gift-stationery-combo": "gift-stationery-sets"
    };

    let gsFixed = 0;
    const gsProducts = await db.collection('products').find({ categories: "gift-stationery" }).toArray();
    for (const p of gsProducts) {
      if (!p.subcategories || p.subcategories.length === 0) continue;
      
      let modified = false;
      const newSubcats = p.subcategories.map(sub => {
        if (gsMapping[sub]) {
          modified = true;
          return gsMapping[sub];
        }
        return sub;
      });

      if (modified) {
        await db.collection('products').updateOne(
          { _id: p._id },
          { $set: { subcategories: newSubcats } }
        );
        gsFixed++;
      }
    }
    console.log(`Fixed subcategory slugs for ${gsFixed} products in gift-stationery.`);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

fixMoreTaxonomy();
