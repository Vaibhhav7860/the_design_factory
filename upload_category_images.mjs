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

const CategorySchema = new mongoose.Schema({
  title: String,
  slug: String,
  image: String,
});

const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  const imagesDir = path.join(process.cwd(), "category_images");
  const files = await fs.readdir(imagesDir);
  
  const imageMap = new Map();
  for (const file of files) {
    const ext = path.extname(file);
    const basename = path.basename(file, ext).toLowerCase();
    imageMap.set(basename, { file, filepath: path.join(imagesDir, file) });
  }

  const categories = await Category.find();
  console.log(`Found ${categories.length} categories.`);

  let updatedCount = 0;

  for (const category of categories) {
    if (category.slug === 'bulk-orders') continue;

    const titleLower = category.title.toLowerCase().replace(/\s+/g, '_');
    const slugLower = category.slug.toLowerCase().replace(/-/g, '_');
    
    let matchedKey = null;
    if (imageMap.has(slugLower)) matchedKey = slugLower;
    else if (imageMap.has(titleLower)) matchedKey = titleLower;
    else if (imageMap.has('shop_by_theme') && category.slug === 'themes') matchedKey = 'shop_by_theme';

    if (matchedKey) {
      const { file, filepath } = imageMap.get(matchedKey);
      console.log(`Mapping [${category.title}] -> ${file}`);

      const buffer = await fs.readFile(filepath);
      const mime = getMimeType(file);
      const ext = path.extname(file);
      
      const hash = crypto.createHash('sha256').update(buffer).digest('hex').substring(0, 8);
      const objectKey = `categories/${category.slug}-${hash}${ext}`;
      
      await s3.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: objectKey,
        Body: buffer,
        ContentType: mime,
      }));
      
      const publicUrl = `${MEDIA_CDN_URL.replace(/\/+$/, "")}/${objectKey}`;
      category.image = publicUrl;
      await category.save();
      console.log(`Updated category ${category.title} image to ${publicUrl}`);
      updatedCount++;
    } else {
      console.log(`No image found for [${category.title}] (Slug: ${category.slug})`);
    }
  }

  console.log(`Successfully updated ${updatedCount} categories.`);
  await mongoose.disconnect();
  console.log("Done.");
}

main().catch(console.error);
