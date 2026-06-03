import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Product } from "../src/lib/db/models/Product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const percentage = 40;
    const val = Number(percentage);

    const products = await Product.find({
      categories: { $ne: "combos" },
      originalPrice: { $gt: 0 }
    });
    
    console.log(`Found ${products.length} products`);

    let updatedCount = 0;
    
    for (const product of products.slice(0, 5)) { // just test on first 5
      if (!product.preGlobalDiscountPrice && product.preGlobalDiscountPrice !== 0) {
        product.preGlobalDiscountPrice = product.price;
      }

      const newPrice = Math.round(product.originalPrice * (1 - val / 100));
      product.price = newPrice;
      
      await product.save();
      updatedCount++;
      console.log(`Updated product ${product.slug} successfully`);
    }

    console.log(`Updated count: ${updatedCount}`);

  } catch (error) {
    console.error("Error saving:", error);
  } finally {
    await mongoose.disconnect();
  }
}

test();
