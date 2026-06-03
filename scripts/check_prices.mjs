import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function checkPrices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const nullPrices = await db.collection('products').countDocuments({ $or: [{ price: null }, { price: { $exists: false } }, { price: NaN }] });
    console.log('Null or NaN prices:', nullPrices);
    
    // Also check if any products were mysteriously marked as inactive
    const inactiveProducts = await db.collection('products').countDocuments({ status: { $ne: 'active' } });
    console.log('Inactive products:', inactiveProducts);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

checkPrices();
