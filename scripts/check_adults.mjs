import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function checkAdultsCorner() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const prods = await db.collection('products').find({ categories: "adults-corner" }).toArray();
    console.log(`Found ${prods.length} products in adults-corner`);

    const subcats = new Set();
    prods.forEach(p => {
      (p.subcategories || []).forEach(s => subcats.add(s));
    });

    console.log("Subcategories present in database for adults-corner:", Array.from(subcats));

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

checkAdultsCorner();
