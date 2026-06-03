import "dotenv/config";
import mongoose from "mongoose";
import { Category } from "./src/lib/db/models/index.js";

const taglines = {
  "labels": "Mark every belonging with intention",
  "school-essentials": "From book labels to lunch boxes",
  "gift-stationery": "Hand-finished gifting paper edits",
  "adults-corner": "Considered pieces for the grown-ups",
  "bags": "Carry your story, beautifully",
  "organisers": "Order, made to feel personal",
  "kids-accessories": "Small details, made memorable",
  "combos": "Curated sets that travel together",
  "themes": "From unicorns to underwater life",
  "bulk-orders": "Corporate and bulk gifting orders"
};

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB for tagline backfill.");

  for (const [slug, tagline] of Object.entries(taglines)) {
    const res = await Category.updateOne({ slug }, { $set: { tagline } });
    console.log(`Updated ${slug}:`, res.modifiedCount);
  }

  console.log("Backfill complete.");
  process.exit(0);
}

run().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
