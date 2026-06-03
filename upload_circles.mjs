import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET;
const MEDIA_CDN_URL = process.env.MEDIA_CDN_URL;
const R2_ENDPOINT = process.env.R2_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
  forcePathStyle: true,
});

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg': case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    case '.svg': return 'image/svg+xml';
    default: return 'application/octet-stream';
  }
}

// Minimal schema to interact with MongoDB
const SubcategorySchema = new mongoose.Schema({
  title: String,
  slug: String,
  image: String,
  circleImage: String,
}, { _id: true });

const CategorySchema = new mongoose.Schema({
  title: String,
  slug: String,
  subcategories: [SubcategorySchema],
});

const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  const circlesDir = path.join(process.cwd(), "Circles (1)");
  const files = await fs.readdir(circlesDir);
  
  // Group files by base name (without "(2)", etc.)
  // We prioritize the file without "(2)" or similar suffixes
  const imageMap = new Map();
  for (const file of files) {
    const ext = path.extname(file);
    const basename = path.basename(file, ext);
    // Remove " (2)", " 2", etc.
    const cleanName = basename.replace(/\s*\(?\d\)?$/, '').trim().toLowerCase();
    
    // If we already have a clean one, don't overwrite it with a numbered one.
    // If the current file is the clean one, it should overwrite the numbered one.
    const isNumbered = /\d\)?$/.test(basename);
    
    if (!imageMap.has(cleanName) || !isNumbered) {
      imageMap.set(cleanName, { file, filepath: path.join(circlesDir, file) });
    }
  }

  const categories = await Category.find();
  console.log(`Found ${categories.length} categories.`);

  for (const category of categories) {
    if (category.slug === 'bulk-orders') continue;

    let updated = false;
    for (const subcat of category.subcategories) {
      // Find matching image
      const titleLower = subcat.title.toLowerCase();
      const slugLower = subcat.slug.toLowerCase().replace(/-/g, ' ');
      
      let matchedKey = null;
      // Exact match title or slug
      if (imageMap.has(titleLower)) matchedKey = titleLower;
      else if (imageMap.has(slugLower)) matchedKey = slugLower;
      // Partial match fallback
      else {
        for (const key of imageMap.keys()) {
          // Careful with short strings like 'cap'
          if (titleLower === key || slugLower === key || titleLower.replace(/s$/, '') === key || key.replace(/s$/, '') === titleLower) {
             matchedKey = key;
             break;
          }
          // specific cases mapping
          if (key === 'superhero' && titleLower === 'superheroes') matchedKey = key;
          if (key.includes('permanent') && titleLower.includes('permenant')) matchedKey = key;
          if (titleLower === 'gift stationery combo - kids' && key === 'gift stationary combo kids') matchedKey = key;
          if (titleLower === 'gift stationery combo - adults' && key === 'gift stationary combo adults') matchedKey = key;
        }
      }
      
      // Additional specific mappings
      if (!matchedKey) {
        if (titleLower.includes('school book')) matchedKey = 'school book labels';
        else if (titleLower.includes('bag combo set')) matchedKey = 'bag combo set';
        else if (titleLower.includes('make your own combo')) matchedKey = null; // No image?
        else if (titleLower.includes('gift stationery combo')) matchedKey = 'gift stationary combo';
        else if (titleLower.includes('waterproof')) matchedKey = 'permanent waterproof stickers';
        else if (titleLower.includes('gift stationery sets')) matchedKey = 'gift stationary sets';
      }

      if (matchedKey && imageMap.has(matchedKey)) {
        const { file, filepath } = imageMap.get(matchedKey);
        console.log(`Mapping [${subcat.title}] -> ${file}`);

        const buffer = await fs.readFile(filepath);
        const mime = getMimeType(file);
        const ext = path.extname(file);
        
        // Upload to S3/R2
        const hash = crypto.createHash('sha256').update(buffer).digest('hex').substring(0, 8);
        const objectKey = `circles/${subcat.slug}-${hash}${ext}`;
        
        await s3.send(new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: objectKey,
          Body: buffer,
          ContentType: mime,
        }));
        
        const publicUrl = `${MEDIA_CDN_URL.replace(/\/+$/, "")}/${objectKey}`;
        subcat.circleImage = publicUrl;
        updated = true;
      } else {
        console.log(`No image found for [${subcat.title}]`);
      }
    }
    
    if (updated) {
      await category.save();
      console.log(`Updated category: ${category.title}`);
    }
  }

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch(console.error);
