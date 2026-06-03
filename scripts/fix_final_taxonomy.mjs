import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function fixFinalTaxonomy() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const gsMapping = {
      "flat-tags": "flat-gift-tags"
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
    console.log(`Fixed subcategory slugs for ${gsFixed} products in gift-stationery (flat-tags -> flat-gift-tags).`);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

fixFinalTaxonomy();
