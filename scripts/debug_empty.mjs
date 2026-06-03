import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function debug() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const emptyCats = await db.collection('products').find({ $or: [{ categories: { $size: 0 } }, { categories: { $exists: false } }] }).limit(5).toArray();
    
    console.log("Products with empty categories:");
    for (const p of emptyCats) {
      console.log(p.slug, "Categories:", p.categories, "Subcategories:", p.subcategories);
    }
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

debug();
