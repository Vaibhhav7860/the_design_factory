/**
 * import-products-from-csv.js
 *
 * Reads products_sheet_sorted_done.csv (Shopify export) and upserts every
 * non-festival product into the MongoDB `products` collection, following
 * the schema defined in src/lib/db/models/Product.js.
 *
 * Usage:  node import-products-from-csv.js
 *
 * Safe to re-run — uses upsert on slug so duplicates are updated, not created.
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import { parse } from "csv-parse/sync";
import { connectToDatabase } from "./src/lib/db/mongoose.js";
import { Product } from "./src/lib/db/models/Product.js";
import { Category } from "./src/lib/db/models/Category.js";

// ────────────────────────────────────────────────────────────────
// 1. Festival / skip-list keywords (matched case-insensitively
//    against the FIRST segment of the Product Category string)
// ────────────────────────────────────────────────────────────────
const SKIP_CATEGORY_KEYWORDS = [
  "rakhi",
  "diwali",
  "christmas",
  "holiday ornaments",
  "uncategorized",
  "apparel",
  "jewelry",
  "bracelets",
  "toys",
  "craft kits",
  "educational toys",
];

function shouldSkipProduct(productCategoryRaw) {
  if (!productCategoryRaw || !productCategoryRaw.trim()) return true;
  const lower = productCategoryRaw.toLowerCase();
  return SKIP_CATEGORY_KEYWORDS.some((kw) => lower.includes(kw));
}

// ────────────────────────────────────────────────────────────────
// 2. Slug helper — same logic used throughout the codebase
// ────────────────────────────────────────────────────────────────
function toSlug(str) {
  return (str || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ────────────────────────────────────────────────────────────────
// 3. Parse the "Product Category" cell into arrays of
//    { category, subcategory } objects
// ────────────────────────────────────────────────────────────────
function parseCategoryCell(raw) {
  if (!raw || !raw.trim()) return [];

  // Multiple category paths are separated by newlines
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  const results = [];

  for (const line of lines) {
    // Split on ">" and trim each segment
    const segments = line.split(">").map((s) => s.trim()).filter(Boolean);

    if (segments.length === 0) continue;

    // First segment is always the category
    const category = segments[0];
    // Last segment is always the subcategory (if more than 1 segment)
    // Middle segments (e.g. "Specialty Labels", "more essentials") are
    // navbar headings — we skip them.
    const subcategory = segments.length > 1 ? segments[segments.length - 1] : null;

    results.push({ category, subcategory });
  }

  return results;
}

// ────────────────────────────────────────────────────────────────
// 4. Match parsed category names to the slugs that already exist
//    in the categories collection
// ────────────────────────────────────────────────────────────────
function buildCategoryLookup(dbCategories) {
  // Maps: normalised slug → actual DB slug (for both categories and subcategories)
  const catSlugMap = {};   // "labels" → "labels"
  const subSlugMap = {};   // "3d-embossed-stickers" → { catSlug, subSlug }

  for (const cat of dbCategories) {
    catSlugMap[cat.slug] = cat.slug;

    for (const sub of cat.subcategories || []) {
      // Key by subcategory slug alone, but store which parent it belongs to
      // When the same sub-slug exists under multiple parents (e.g.
      // "school-book-labels" under Labels AND School Essentials) we keep
      // ALL of them keyed by "catSlug/subSlug".
      const compositeKey = `${cat.slug}/${sub.slug}`;
      subSlugMap[compositeKey] = { catSlug: cat.slug, subSlug: sub.slug };
      // Also store by sub slug alone for fallback matching
      if (!subSlugMap[sub.slug]) {
        subSlugMap[sub.slug] = { catSlug: cat.slug, subSlug: sub.slug };
      }
    }
  }

  return { catSlugMap, subSlugMap };
}

function matchCategories(parsed, lookup) {
  const categories = new Set();
  const subcategories = new Set();

  for (const { category, subcategory } of parsed) {
    const catSlug = toSlug(category);

    // Try to match the category slug directly
    if (lookup.catSlugMap[catSlug]) {
      categories.add(lookup.catSlugMap[catSlug]);
    }

    if (subcategory) {
      const subSlug = toSlug(subcategory);

      // First try composite key (specific parent)
      const compositeKey = `${catSlug}/${subSlug}`;
      if (lookup.subSlugMap[compositeKey]) {
        const match = lookup.subSlugMap[compositeKey];
        categories.add(match.catSlug);
        subcategories.add(match.subSlug);
      } else if (lookup.subSlugMap[subSlug]) {
        // Fallback: match by sub slug alone
        const match = lookup.subSlugMap[subSlug];
        categories.add(match.catSlug);
        subcategories.add(match.subSlug);
      } else {
        // No match found — use the generated slugs directly so we still
        // store something useful
        if (catSlug) categories.add(catSlug);
        subcategories.add(subSlug);
      }
    }
  }

  return {
    categories: [...categories],
    subcategories: [...subcategories],
  };
}

// ────────────────────────────────────────────────────────────────
// 5. Main
// ────────────────────────────────────────────────────────────────
async function main() {
  console.log("Connecting to MongoDB…");
  await connectToDatabase();

  // Load existing categories from DB for matching
  const dbCategories = await Category.find({}).lean();
  console.log(`Loaded ${dbCategories.length} categories from DB`);
  const lookup = buildCategoryLookup(dbCategories);

  // Parse CSV
  const csvData = fs.readFileSync("products_sheet_sorted_done.csv", "utf8");
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });
  console.log(`Parsed ${records.length} CSV rows`);

  // Group rows by Handle
  const handleMap = new Map();
  for (const row of records) {
    const handle = row["Handle"]?.trim();
    if (!handle) continue;
    if (!handleMap.has(handle)) handleMap.set(handle, []);
    handleMap.get(handle).push(row);
  }
  console.log(`Found ${handleMap.size} unique product handles`);

  // Process each product
  let imported = 0;
  let skippedFestival = 0;
  let skippedNoCategory = 0;
  let errors = 0;
  const unmatchedCategories = new Set();

  for (const [handle, rows] of handleMap) {
    // The first row contains the product's master data
    const master = rows[0];

    // ── Skip festival products ──
    const productCategoryRaw = master["Product Category"] || "";
    if (shouldSkipProduct(productCategoryRaw)) {
      skippedFestival++;
      continue;
    }

    // ── Parse categories ──
    const parsed = parseCategoryCell(productCategoryRaw);
    const { categories, subcategories } = matchCategories(parsed, lookup);

    if (categories.length === 0) {
      skippedNoCategory++;
      unmatchedCategories.add(productCategoryRaw.replace(/\n/g, " | "));
      continue;
    }

    // ── Collect images (ordered by Image Position) ──
    const imageEntries = rows
      .filter((r) => r["Image Src"]?.trim())
      .map((r) => ({
        src: r["Image Src"].trim(),
        position: parseInt(r["Image Position"], 10) || 999,
      }))
      .sort((a, b) => a.position - b.position);

    const images = [...new Set(imageEntries.map((e) => e.src))];

    // ── Extract price (CSV is in rupees, schema is in paise) ──
    const priceRupees = parseFloat(master["Variant Price"]) || 0;
    const price = Math.round(priceRupees * 100);

    const compareAtRupees = parseFloat(master["Variant Compare At Price"]) || 0;
    const originalPrice = compareAtRupees > 0 ? Math.round(compareAtRupees * 100) : undefined;

    // ── Title ──
    const title = (master["Title"] || "").replace(/\s+/g, " ").trim();

    // ── Description ──
    const description = (master["Body (HTML)"] || "").trim();

    // ── Slug ──
    const slug = handle;

    // ── SEO ──
    const seoTitle = (master["SEO Title"] || "").trim() || undefined;
    const seoDescription = (master["SEO Description"] || "").trim() || undefined;

    // ── Build the product document ──
    const productDoc = {
      title,
      slug,
      description,
      categories,
      subcategories,
      price,
      ...(originalPrice && { originalPrice }),
      images,
      status: "active",
      personalisation: {
        name: "optional",
        school: "hidden",
        fontSelector: "enabled",
        additionalFee: 0,
      },
      variants: [],
      tags: [],
      ...(seoTitle || seoDescription
        ? { seo: { ...(seoTitle && { title: seoTitle }), ...(seoDescription && { description: seoDescription }) } }
        : {}),
    };

    try {
      await Product.findOneAndUpdate(
        { slug },
        { $set: productDoc },
        { upsert: true, new: true, runValidators: true }
      );
      imported++;

      if (imported % 50 === 0) {
        console.log(`  … imported ${imported} products so far`);
      }
    } catch (err) {
      errors++;
      console.error(`ERROR importing "${title}" (${slug}):`, err.message);
    }
  }

  // ── Summary ──
  console.log("\n═══════════════════════════════════════════");
  console.log("  IMPORT COMPLETE");
  console.log("═══════════════════════════════════════════");
  console.log(`  Imported / updated:  ${imported}`);
  console.log(`  Skipped (festival):  ${skippedFestival}`);
  console.log(`  Skipped (no match):  ${skippedNoCategory}`);
  console.log(`  Errors:              ${errors}`);
  console.log("═══════════════════════════════════════════");

  if (unmatchedCategories.size > 0) {
    console.log("\nUnmatched category strings:");
    for (const c of unmatchedCategories) {
      console.log(`  - ${c}`);
    }
  }

  // Final count
  const total = await Product.countDocuments();
  console.log(`\nTotal products in DB now: ${total}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
