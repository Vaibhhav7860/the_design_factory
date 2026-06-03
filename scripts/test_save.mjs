import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Product } from "../src/lib/db/models/Product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function testSave() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find a known product
    const doc = await Product.findOne({ slug: "art-bag-mermaid" });
    console.log("Before save:");
    console.log("Categories:", doc.categories);
    console.log("Subcategories:", doc.subcategories);
    
    doc.price = doc.price - 1; // dummy change
    await doc.save({ validateBeforeSave: false });
    
    const docAfter = await Product.findOne({ slug: "art-bag-mermaid" });
    console.log("After save:");
    console.log("Categories:", docAfter.categories);
    console.log("Subcategories:", docAfter.subcategories);
    
    doc.price = doc.price + 1; // restore
    await doc.save({ validateBeforeSave: false });
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

testSave();
