import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import { Category } from "./src/lib/db/models/index.js";
import { categories } from "./src/data/categories.js";
import { saveUpload } from "./src/lib/storage/index.js";

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  console.log("Clearing existing categories...");
  await Category.deleteMany({});

  const results = [];
  
  for (const cat of categories) {
    console.log(`Migrating category: ${cat.title}`);
    
    // 1. Upload category image
    let categoryImageUrl = cat.image;
    if (cat.image && cat.image.startsWith("/")) {
      try {
        const localPath = path.join(process.cwd(), "public", cat.image);
        const buffer = await fs.readFile(localPath);
        const mime = cat.image.endsWith(".png") ? "image/png" : "image/webp";
        
        const saved = await saveUpload({
          buffer,
          mime,
          originalName: path.basename(cat.image),
          folder: `categories/${cat.slug}`,
        });
        categoryImageUrl = saved.url;
        console.log(` - Uploaded image to: ${categoryImageUrl}`);
      } catch (err) {
        console.error(` - Failed to upload image for category ${cat.slug}:`, err);
      }
    }
    
    const newSubcategories = [];
    for (const sub of (cat.subcategories || [])) {
      newSubcategories.push({
        title: sub.title,
        slug: sub.slug,
        image: sub.image || null,
      });
    }
    
    const newCat = await Category.create({
      title: cat.title,
      slug: cat.slug,
      description: cat.description,
      image: categoryImageUrl,
      featured: cat.featured,
      subcategories: newSubcategories,
    });
    
    results.push(newCat);
  }
  
  console.log(`Successfully migrated ${results.length} categories.`);
  process.exit(0);
}

run().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
