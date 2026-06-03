import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function countSubcats() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const prods = await db.collection('products').find({ subcategories: { $exists: true, $not: { $size: 0 } } }).toArray();
    console.log('Products with valid subcategories:', prods.length);

    // Group by category to see if any are missing
    const catCounts = {};
    const subcatCounts = {};

    for (const p of prods) {
      for (const c of p.categories || []) {
        catCounts[c] = (catCounts[c] || 0) + 1;
      }
      for (const s of p.subcategories || []) {
        subcatCounts[s] = (subcatCounts[s] || 0) + 1;
      }
    }

    console.log("Category counts:", catCounts);
    console.log("Subcategory counts:", subcatCounts);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

countSubcats();
