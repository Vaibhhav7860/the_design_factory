/**
 * Deeper analysis: multi-image products, variant rows, and more category edge cases.
 */
import fs from "node:fs";
import { parse } from "csv-parse/sync";

const raw = fs.readFileSync("products_sheet_sorted_done.csv", "utf-8");
const rows = parse(raw, {
  columns: true,
  skip_empty_lines: true,
  relax_column_count: true,
  relax_quotes: true,
});

// Group by Handle
const products = new Map();
for (const row of rows) {
  const handle = row["Handle"]?.trim();
  if (!handle) continue;
  if (!products.has(handle)) products.set(handle, []);
  products.get(handle).push(row);
}

// Find multi-image products
console.log("=== MULTI-IMAGE PRODUCTS (first 10) ===");
let multiImgCount = 0;
for (const [handle, rowGroup] of products) {
  const images = rowGroup
    .map((r) => r["Image Src"]?.trim())
    .filter(Boolean);
  if (images.length > 1) {
    multiImgCount++;
    if (multiImgCount <= 10) {
      console.log(`\n  ${handle} (${images.length} images)`);
      console.log(`    Title: ${rowGroup[0]["Title"]}`);
      images.forEach((img, i) => {
        // Check which row has title vs empty title (image-only row)
        const row = rowGroup.find(r => r["Image Src"]?.trim() === img);
        const hasTitle = row?.["Title"]?.trim();
        console.log(`    [${i}] ${hasTitle ? "MAIN" : "IMG-ONLY"}: ${img.substring(0, 80)}`);
      });
    }
  }
}
console.log(`\nTotal multi-image products: ${multiImgCount}`);
console.log(`Total single-image products: ${products.size - multiImgCount}`);

// Understand row structure: which fields are filled on image-only rows
console.log("\n\n=== IMAGE-ONLY ROW ANALYSIS (rows with same Handle but no Title) ===");
let imgOnlyWithPrice = 0;
let imgOnlyWithOption = 0;
let imgOnlyTotal = 0;
for (const [handle, rowGroup] of products) {
  for (let i = 1; i < rowGroup.length; i++) {
    const row = rowGroup[i];
    const hasTitle = row["Title"]?.trim();
    const hasImage = row["Image Src"]?.trim();
    if (!hasTitle && hasImage) {
      imgOnlyTotal++;
      if (row["Variant Price"]?.trim()) imgOnlyWithPrice++;
      if (row["Option1 Value"]?.trim()) imgOnlyWithOption++;
    }
    // Variant rows: have option value but may also have image
    if (row["Option1 Value"]?.trim() && !hasTitle) {
      // This is likely a variant row
    }
  }
}
console.log(`  Total image-only continuation rows: ${imgOnlyTotal}`);
console.log(`  ...with variant price: ${imgOnlyWithPrice}`);
console.log(`  ...with option value: ${imgOnlyWithOption}`);

// Look at variant rows (rows with Option1 Value set)
console.log("\n\n=== VARIANT ROW EXAMPLES ===");
let variantProductCount = 0;
for (const [handle, rowGroup] of products) {
  const variantRows = rowGroup.filter(r => r["Option1 Value"]?.trim());
  if (variantRows.length > 1) {
    variantProductCount++;
    if (variantProductCount <= 5) {
      console.log(`\n  ${handle}: ${variantRows.length} variants`);
      variantRows.forEach((r, i) => {
        console.log(`    Variant ${i}: ${r["Option1 Name"]}=${r["Option1 Value"]}, SKU=${r["Variant SKU"]}, Price=${r["Variant Price"]}, Compare=${r["Variant Compare At Price"]}, Image=${r["Image Src"]?.substring(0,50) || "(none)"}`);
      });
    }
  }
}
console.log(`\nTotal products with >1 variant: ${variantProductCount}`);

// Count active vs draft vs other
const statusCounts = {};
for (const [handle, rowGroup] of products) {
  const s = rowGroup[0]["Status"]?.trim()?.toLowerCase() || "unknown";
  statusCounts[s] = (statusCounts[s] || 0) + 1;
}
console.log("\n\n=== STATUS DISTRIBUTION ===");
for (const [k, v] of Object.entries(statusCounts)) {
  console.log(`  ${k}: ${v}`);
}

// Check a "Bags > Art bags" type category (2-layer)
console.log("\n\n=== 2-LAYER CATEGORY PRODUCTS ===");
for (const [handle, rowGroup] of products) {
  const cat = rowGroup[0]["Product Category"]?.trim();
  if (cat && !cat.includes("\n")) {
    const parts = cat.split(">").map(s => s.trim());
    if (parts.length === 2) {
      console.log(`  ${handle}: "${cat}" -> category="${parts[0]}", subcategory="${parts[1]}"`);
    }
  }
}
