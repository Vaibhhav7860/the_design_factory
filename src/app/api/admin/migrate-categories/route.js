import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Category } from "@/lib/db/models";
import { categories } from "@/data/categories";
import { saveUpload } from "@/lib/storage/index";
import fs from "fs/promises";
import path from "path";

export async function GET(req) {
  try {
    await connectToDatabase();
    
    // Clear existing
    await Category.deleteMany({});
    
    const results = [];
    
    for (const cat of categories) {
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
        } catch (err) {
          console.error(`Failed to upload image for category ${cat.slug}:`, err);
        }
      }
      
      const newSubcategories = [];
      for (const sub of (cat.subcategories || [])) {
        // For subcategories, if they have an image in the future, we upload it.
        // Currently, categories.js doesn't define images for subcategories, but the schema supports it.
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
    
    return NextResponse.json({ success: true, migrated: results.length, data: results });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
