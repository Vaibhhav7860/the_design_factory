import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { connectToDatabase } from "./src/lib/db/mongoose.js";
import { Product } from "./src/lib/db/models/Product.js";

async function run() {
  await connectToDatabase();
  const products = await Product.find({
    originalPrice: { $exists: true, $gt: 0 },
  });
  let fixed = 0;
  for (const p of products) {
    if (p.originalPrice > p.price) {
      // .save() triggers the pre-save hook which computes discountPercent
      await p.save();
      fixed++;
    }
  }
  console.log("Fixed discount percentages for", fixed, "products");
  process.exit(0);
}
run();
