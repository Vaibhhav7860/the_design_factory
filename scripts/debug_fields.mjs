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

    const p = await db.collection('products').findOne({ category: { $exists: true } });
    if (p) {
      console.log('Found product with category field:', p.slug, 'category:', p.category);
    } else {
      console.log('No product has category field.');
    }

    const sub = await db.collection('products').findOne({ subcategory: { $exists: true } });
    if (sub) {
      console.log('Found product with subcategory field:', sub.slug, 'subcategory:', sub.subcategory);
    } else {
      console.log('No product has subcategory field.');
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

debug();
