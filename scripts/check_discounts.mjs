import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function checkDiscounts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const nanDiscounts = await db.collection('products').countDocuments({ $or: [{ discountPercent: null }, { discountPercent: { $exists: false } }, { discountPercent: NaN }] });
    console.log('Null or NaN discountPercent:', nanDiscounts);
    
    // Check if any products have empty categories but are active
    const emptyCatsActive = await db.collection('products').countDocuments({ status: 'active', $or: [{ categories: { $size: 0 } }, { categories: { $exists: false } }] });
    console.log('Active products with empty categories:', emptyCatsActive);
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

checkDiscounts();
