import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const emptyCats = await db.collection('products').countDocuments({ $or: [{ categories: { $size: 0 } }, { categories: { $exists: false } }] });
    const emptySubcats = await db.collection('products').countDocuments({ $or: [{ subcategories: { $size: 0 } }, { subcategories: { $exists: false } }] });
    
    console.log('Empty categories:', emptyCats, 'Empty subcategories:', emptySubcats);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

check();
