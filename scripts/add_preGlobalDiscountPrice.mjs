import mongoose from "mongoose";
import dotenv from "dotenv";
import { resolve } from "path";
import { Product } from "../src/lib/db/models/Product.js";

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not defined in .env.local");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("Connected.");

  console.log("Updating products...");
  
  // Use updateMany with an aggregation pipeline to set preGlobalDiscountPrice to the value of price.
  // This avoids triggering mongoose schema validation on older products that might be missing categories.
  const result = await Product.collection.updateMany(
    { preGlobalDiscountPrice: { $exists: false } },
    [{ $set: { preGlobalDiscountPrice: "$price" } }]
  );

  console.log(`\nSuccessfully matched ${result.matchedCount} and updated ${result.modifiedCount} products with the preGlobalDiscountPrice key.`);
  
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
