import "dotenv/config";
import mongoose from "mongoose";
import { Category } from "./src/lib/db/models/index.js";

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  const allowedSlugs = [
    'labels', 'school-essentials', 'gift-stationery', 'adults-corner', 
    'bags', 'organisers', 'kids-accessories', 'combos', 'themes', 'bulk-orders'
  ];
  
  const result = await Category.deleteMany({ slug: { $nin: allowedSlugs } });
  console.log(`Deleted ${result.deletedCount} extra categories.`);
  
  // Also check if bulk-orders exists, if not, create it
  const bulkOrders = await Category.findOne({ slug: 'bulk-orders' });
  if (!bulkOrders) {
    await Category.create({
      title: 'Bulk Orders',
      slug: 'bulk-orders',
      description: 'Corporate and bulk gifting orders',
      image: '/images/categories/bulk-orders.png',
      featured: false,
      subcategories: []
    });
    console.log('Created Bulk Orders category.');
  }

  process.exit(0);
}

run().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
