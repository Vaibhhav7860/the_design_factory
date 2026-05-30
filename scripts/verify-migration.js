/**
 * Quick read-only check: pulls one product from MongoDB by slug and prints
 * its current images array, alongside what processed_products.json said
 * it should be before migration. Lets you eyeball that the migrated URLs
 * landed on the right document and in the right order.
 *
 *   node scripts/verify-migration.js storage-bin-rocket
 */
import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
for (const file of [".env.local", ".env"]) {
  const full = path.join(projectRoot, file);
  if (fs.existsSync(full)) dotenv.config({ path: full, override: false });
}

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: node scripts/verify-migration.js <slug>");
  process.exit(1);
}

const { connectToDatabase, mongoose } = await import(
  "../src/lib/db/mongoose.js"
);
const { Product } = await import("../src/lib/db/models/Product.js");

await connectToDatabase();

const seedData = JSON.parse(
  fs.readFileSync(path.join(projectRoot, "processed_products.json"), "utf8")
);
const seed = seedData.find((p) => p.slug === slug);

const doc = await Product.findOne({ slug }).lean();
if (!doc) {
  console.error(`No product with slug "${slug}"`);
  process.exit(1);
}

console.log(`Product   : ${doc.title}`);
console.log(`_id       : ${doc._id}`);
console.log(`slug      : ${doc.slug}`);
console.log(`needsAssetMigration: ${doc.needsAssetMigration}`);
console.log("");
console.log("Original Shopify images (from processed_products.json):");
(seed?.images || []).forEach((u, i) => console.log(`  [${i}] ${u}`));
console.log("");
console.log("Current images in MongoDB:");
(doc.images || []).forEach((u, i) => console.log(`  [${i}] ${u}`));

console.log("");
const cdn = (process.env.MEDIA_CDN_URL || "").replace(/\/+$/, "");
const allOnCdn = (doc.images || []).every((u) => u.startsWith(cdn));
console.log(`All on CDN? ${allOnCdn}`);
console.log(`Same length? ${(seed?.images?.length || 0) === (doc.images?.length || 0)}`);

await mongoose.disconnect();
