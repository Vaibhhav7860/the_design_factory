/**
 * Import products from Shopify's CSV export into our MongoDB products collection.
 *
 * Reads `products_sheet_sorted_done.csv`, groups rows by Handle (slug),
 * parses the hierarchical Product Category column into categories[] and
 * subcategories[], collects all images, and upserts into MongoDB.
 *
 * Festival products (Rakhi, Diwali, Christmas, etc.) are skipped.
 *
 * Usage:
 *   node scripts/import-products-from-csv.mjs                 # full import
 *   node scripts/import-products-from-csv.mjs --dry-run       # preview only
 *   node scripts/import-products-from-csv.mjs --limit=50      # first 50
 */
import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";

// ── Bootstrap env ───────────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

for (const file of [".env.local", ".env.development", ".env"]) {
  const full = path.join(projectRoot, file);
  if (fs.existsSync(full)) dotenv.config({ path: full, override: false });
}

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set. Add it to .env.local at the project root.");
  process.exit(1);
}

// ── CLI flags ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function flag(name, fallback = undefined) {
  const hit = args.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return fallback;
  if (!hit.includes("=")) return true;
  return hit.split("=").slice(1).join("=");
}

const DRY_RUN = !!flag("dry-run", false);
const LIMIT = Number(flag("limit", 0)) || 0;

console.log(`Config: dryRun=${DRY_RUN}  limit=${LIMIT || "all"}\n`);

// ── Imports that depend on env ──────────────────────────────────────────────
const { connectToDatabase, mongoose } = await import("../src/lib/db/mongoose.js");
const { Product } = await import("../src/lib/db/models/Product.js");

// ── Festival keywords to skip ───────────────────────────────────────────────
const FESTIVAL_KEYWORDS = [
  "rakhi", "diwali", "holi", "christmas", "easter", "eid",
  "navratri", "ganesh", "onam", "pongal", "valentine",
];

function isFestivalProduct(title, tags, category) {
  const haystack = `${title}|${tags}|${category}`.toLowerCase();
  return FESTIVAL_KEYWORDS.some((kw) => haystack.includes(kw));
}

// ── Category parsing ────────────────────────────────────────────────────────
/**
 * Parse the Product Category cell into { categories, subcategories }.
 *
 * Possible formats:
 *   "Labels > Specialty Labels > 3D embossed stickers"
 *      → category = "Labels", subcategory = "3D embossed stickers"
 *
 *   "Bags > Art bags"
 *      → category = "Bags", subcategory = "Art bags"
 *
 *   Multi-entry (newline separated):
 *   "Labels > Specialty Labels > 3D embossed stickers\nSchool Essentials> Labels > 3D embossed stickers"
 *      → categories = ["Labels", "School Essentials"], subcategories = ["3D embossed stickers"]
 *
 *   Single word / Uncategorized:
 *   "Uncategorized" or "Diwali"
 *      → category = "Uncategorized" / "Diwali", no subcategory
 */
function parseCategories(rawCategoryCell) {
  if (!rawCategoryCell || !rawCategoryCell.trim()) {
    return { categories: ["Uncategorized"], subcategories: [] };
  }

  const categories = new Set();
  const subcategories = new Set();

  // Split by newline for multi-entry
  const entries = rawCategoryCell.split("\n").map((s) => s.trim()).filter(Boolean);

  for (const entry of entries) {
    const parts = entry.split(">").map((s) => s.trim()).filter(Boolean);

    if (parts.length >= 3) {
      // 3-layer: Category > Navbar Heading > Subcategory
      categories.add(parts[0]);
      subcategories.add(parts[parts.length - 1]);
    } else if (parts.length === 2) {
      // 2-layer: Category > Subcategory
      categories.add(parts[0]);
      subcategories.add(parts[1]);
    } else if (parts.length === 1) {
      // Single value — treat as category
      categories.add(parts[0]);
    }
  }

  return {
    categories: [...categories],
    subcategories: [...subcategories],
  };
}

// ── Slug helper ─────────────────────────────────────────────────────────────
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ── Read & parse CSV ────────────────────────────────────────────────────────
console.log("→ Reading CSV…");
const csvPath = path.join(projectRoot, "products_sheet_sorted_done.csv");
if (!fs.existsSync(csvPath)) {
  console.error(`CSV not found at: ${csvPath}`);
  process.exit(1);
}

const rawCsv = fs.readFileSync(csvPath, "utf-8");
const rows = parse(rawCsv, {
  columns: true,
  skip_empty_lines: true,
  relax_column_count: true,
  relax_quotes: true,
});
console.log(`  ✓ Parsed ${rows.length} CSV rows\n`);

// ── Group rows by Handle ────────────────────────────────────────────────────
console.log("→ Grouping rows by Handle…");
const productGroups = new Map();
for (const row of rows) {
  const handle = row["Handle"]?.trim();
  if (!handle) continue;
  if (!productGroups.has(handle)) productGroups.set(handle, []);
  productGroups.get(handle).push(row);
}
console.log(`  ✓ ${productGroups.size} unique products found\n`);

// ── Build product documents ─────────────────────────────────────────────────
console.log("→ Building product documents…\n");

const productsToInsert = [];
let skippedFestival = 0;
let skippedNoTitle = 0;
let skippedNoPrice = 0;

for (const [handle, rowGroup] of productGroups) {
  // The first row with a Title is the "main" row
  const mainRow = rowGroup.find((r) => r["Title"]?.trim()) || rowGroup[0];

  const title = mainRow["Title"]?.trim();
  if (!title) {
    skippedNoTitle++;
    continue;
  }

  const slug = handle.toLowerCase().trim();
  const rawCategory = mainRow["Product Category"]?.trim() || "";
  const tags = mainRow["Tags"]?.trim() || "";

  // Skip festival products
  if (isFestivalProduct(title, tags, rawCategory)) {
    skippedFestival++;
    continue;
  }

  // Price (stored in rupees, not paise)
  const priceStr = mainRow["Variant Price"]?.trim();
  const price = priceStr ? parseFloat(priceStr) : 0;
  if (!price || price <= 0) {
    skippedNoPrice++;
    console.log(`  ⚠ Skipping "${title}" — no valid price (${priceStr})`);
    continue;
  }

  const compareAtStr = mainRow["Variant Compare At Price"]?.trim();
  const originalPrice = compareAtStr ? parseFloat(compareAtStr) : undefined;

  // Description (Body HTML)
  const description = mainRow["Body (HTML)"]?.trim() || "";

  // Categories & Subcategories
  const { categories, subcategories } = parseCategories(rawCategory);

  // Images — collect from ALL rows in the group, maintain order
  const images = [];
  for (const row of rowGroup) {
    const imgSrc = row["Image Src"]?.trim();
    if (imgSrc && !images.includes(imgSrc)) {
      images.push(imgSrc);
    }
  }

  // Status
  const csvStatus = mainRow["Status"]?.trim()?.toLowerCase();
  const status = csvStatus === "active" ? "active" : "draft";

  // Variant (single variant per product based on analysis)
  const sku = mainRow["Variant SKU"]?.trim() || slug;
  const option1Name = mainRow["Option1 Name"]?.trim();
  const option1Value = mainRow["Option1 Value"]?.trim();
  const variantOptions = {};
  if (option1Name && option1Value) {
    variantOptions[option1Name] = option1Value;
  }

  const variant = {
    sku,
    options: variantOptions,
    price,
    inventory: parseInt(mainRow["Variant Inventory Qty"]?.trim()) || 0,
    weightGrams: parseInt(mainRow["Variant Grams"]?.trim()) || 0,
  };

  // Tags — parse comma-separated tags into the TagSchema format
  const parsedTags = [];
  if (tags) {
    const tagColors = ["#FCD589", "#A7D8DE", "#F5A5B8", "#B5D8A0", "#C4B5E0"];
    const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
    tagList.forEach((label, i) => {
      if (label.length <= 40) {
        parsedTags.push({
          label,
          color: tagColors[i % tagColors.length],
        });
      }
    });
  }

  // Build the product document
  const productDoc = {
    title,
    slug,
    description,
    categories,
    subcategories,
    price,
    originalPrice: originalPrice && originalPrice > price ? originalPrice : undefined,
    images,
    needsAssetMigration: images.some((u) => u.startsWith("http")),
    variants: [variant],
    tags: parsedTags,
    status,
  };

  productsToInsert.push(productDoc);

  if (LIMIT && productsToInsert.length >= LIMIT) break;
}

console.log(`\n─────────────────────────────────`);
console.log(`  Products to import : ${productsToInsert.length}`);
console.log(`  Skipped (festival) : ${skippedFestival}`);
console.log(`  Skipped (no title) : ${skippedNoTitle}`);
console.log(`  Skipped (no price) : ${skippedNoPrice}`);
console.log(`─────────────────────────────────\n`);

if (DRY_RUN) {
  console.log("=== DRY RUN — Sample products ===\n");
  const samples = productsToInsert.slice(0, 5);
  for (const p of samples) {
    console.log(`  ${p.slug}`);
    console.log(`    Title:         ${p.title}`);
    console.log(`    Categories:    [${p.categories.join(", ")}]`);
    console.log(`    Subcategories: [${p.subcategories.join(", ")}]`);
    console.log(`    Price:         ₹${p.price}${p.originalPrice ? ` (was ₹${p.originalPrice})` : ""}`);
    console.log(`    Images:        ${p.images.length}`);
    console.log(`    Status:        ${p.status}`);
    console.log(`    Tags:          [${p.tags.map((t) => t.label).join(", ")}]`);
    console.log(`    Variant SKU:   ${p.variants[0]?.sku}`);
    console.log("");
  }

  // Show category distribution
  const catCount = {};
  for (const p of productsToInsert) {
    for (const c of p.categories) {
      catCount[c] = (catCount[c] || 0) + 1;
    }
  }
  console.log("=== Category Distribution ===");
  for (const [cat, count] of Object.entries(catCount).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }
  console.log("\n(No database changes made in dry-run mode)");
  await mongoose.disconnect();
  process.exit(0);
}

// ── Write to MongoDB ────────────────────────────────────────────────────────
console.log("→ Connecting to MongoDB…");
await connectToDatabase();
console.log("  ✓ connected\n");

console.log("→ Upserting products…\n");

const bulkOps = productsToInsert.map((doc) => ({
  updateOne: {
    filter: { slug: doc.slug },
    update: {
      $set: {
        title: doc.title,
        description: doc.description,
        categories: doc.categories,
        subcategories: doc.subcategories,
        price: doc.price,
        ...(doc.originalPrice != null ? { originalPrice: doc.originalPrice } : {}),
        images: doc.images,
        needsAssetMigration: doc.needsAssetMigration,
        variants: doc.variants,
        tags: doc.tags,
        status: doc.status,
      },
      $setOnInsert: {
        slug: doc.slug,
        salesCount: 0,
        version: 0,
      },
    },
    upsert: true,
  },
}));

// Execute in batches of 100
const BATCH_SIZE = 100;
let totalInserted = 0;
let totalUpdated = 0;

for (let i = 0; i < bulkOps.length; i += BATCH_SIZE) {
  const batch = bulkOps.slice(i, i + BATCH_SIZE);
  const result = await Product.bulkWrite(batch, { ordered: false });

  totalInserted += result.upsertedCount || 0;
  totalUpdated += result.modifiedCount || 0;

  const batchEnd = Math.min(i + BATCH_SIZE, bulkOps.length);
  console.log(
    `  Batch ${Math.floor(i / BATCH_SIZE) + 1}: ` +
    `${batchEnd}/${bulkOps.length} processed ` +
    `(${result.upsertedCount || 0} inserted, ${result.modifiedCount || 0} updated)`
  );
}

console.log(`\n─────────────────────────────────`);
console.log(`  Summary`);
console.log(`─────────────────────────────────`);
console.log(`  Total processed   : ${productsToInsert.length}`);
console.log(`  Inserted (new)    : ${totalInserted}`);
console.log(`  Updated (existing): ${totalUpdated}`);
console.log(`  Skipped (festival): ${skippedFestival}`);
console.log(`─────────────────────────────────\n`);

await mongoose.disconnect();
console.log("Done! ✓");
