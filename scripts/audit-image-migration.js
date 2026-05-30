/**
 * Read-only audit of the image migration. Scans every product and reports
 *   how many are fully on the CDN
 *   how many still have at least one external URL
 *   how many have no images at all
 *
 *   node scripts/audit-image-migration.js
 *   node scripts/audit-image-migration.js --verbose   (lists offenders)
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

const verbose = process.argv.includes("--verbose");

const { connectToDatabase, mongoose } = await import(
  "../src/lib/db/mongoose.js"
);
const { Product } = await import("../src/lib/db/models/Product.js");

await connectToDatabase();
const cdn = (process.env.MEDIA_CDN_URL || "").replace(/\/+$/, "");
const PAGE = 200;
let lastId = null;
let total = 0;
let migrated = 0;
let pending = 0;
let empty = 0;
const offenders = [];

while (true) {
  const filter = lastId ? { _id: { $gt: lastId } } : {};
  const page = await Product.find(filter)
    .select("slug title images needsAssetMigration")
    .sort({ _id: 1 })
    .limit(PAGE)
    .lean();
  if (page.length === 0) break;
  lastId = page[page.length - 1]._id;
  for (const p of page) {
    total++;
    if (!p.images?.length) {
      empty++;
      if (verbose) offenders.push({ slug: p.slug, reason: "no images" });
      continue;
    }
    const externals = p.images.filter(
      (u) =>
        typeof u === "string" &&
        /^https?:\/\//i.test(u) &&
        !(cdn && u.startsWith(cdn))
    );
    if (externals.length === 0) {
      migrated++;
    } else {
      pending++;
      if (verbose) offenders.push({ slug: p.slug, externals });
    }
  }
  if (page.length < PAGE) break;
}

console.log("─────────────────────────────────");
console.log(`Total products       : ${total}`);
console.log(`Fully on CDN         : ${migrated}`);
console.log(`Still has external   : ${pending}`);
console.log(`Empty images array   : ${empty}`);
console.log("─────────────────────────────────");

if (verbose && offenders.length) {
  console.log("\nOffenders:");
  for (const o of offenders.slice(0, 50)) {
    if (o.externals) {
      console.log(`  ${o.slug}`);
      o.externals.forEach((u) => console.log(`    - ${u}`));
    } else {
      console.log(`  ${o.slug}  (${o.reason})`);
    }
  }
  if (offenders.length > 50) {
    console.log(`  …and ${offenders.length - 50} more.`);
  }
}

await mongoose.disconnect();
