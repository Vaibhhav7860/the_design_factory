import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

dotenv.config({ path: ".env.local" });

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

async function main() {
  const videoPath = path.join(process.cwd(), "public", "videos", "hero_video_optimized.mp4");
  const buffer = await fs.readFile(videoPath);
  
  const objectKey = `videos/hero_video_optimized.mp4`;
  
  console.log(`Uploading ${videoPath} to ${objectKey}... Size: ${buffer.length} bytes`);
  
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: objectKey,
    Body: buffer,
    ContentType: "video/mp4",
  }));
  
  const publicUrl = `${MEDIA_CDN_URL.replace(/\/+$/, "")}/${objectKey}`;
  console.log(`Successfully uploaded video to ${publicUrl}`);
}

main().catch(console.error);
