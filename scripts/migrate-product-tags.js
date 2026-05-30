/**
 * Persist the storefront's currently-displayed tags into MongoDB.
 *
 * The product card uses a deterministic hash of the slug to pick 2 tags
 * + colours per product, so what shows on screen is reproducible. This
 * script computes the *exact* same pair for every product and writes
 * them into Product.tags so the values shown to customers are now
 * stored alongside the product, not derived at render time.
 *
 *   npm run migrate:tags                 # write tags for every product
 *   npm run migrate:tags -- --dry-run    # show what would be written
 *   npm run migrate:tags -- --slug=...   # one product
 *   npm run migrate:tags -- --force      # overwrite existing tags
 *
 * Idempotent: re-running on the same data produces the same output.
 * By default products that already have tags are skipped — pass --force
 * to overwrite them.
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
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set.");
  process.exit(1);
}

// ── CLI flags ──────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
function flag(name, fallback = undefined) {
  const hit = argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return fallback;
  if (!hit.includes("=")) return true;
  return hit.split("=").slice(1).join("=");
}
const DRY_RUN = !!flag("dry-run", false);
const FORCE = !!flag("force", false);
const ONLY_SLUG = typeof flag("slug") === "string" ? flag("slug") : null;
const PAGE = 200;

// ── Tag generator (mirrors src/components/product/ProductCard.js) ──────────
//
// IMPORTANT: this logic must match `getProductTags` in ProductCard.js
// exactly. If you ever tweak the tag set or the hash, update both
// places together so existing products keep showing the same chips.
const TAG_OPTIONS = [
  "Express",
  "New",
  "Trending",
  "New Drop",
  "Top Pick",
  "Most 💖",
];
const TAG_COLORS = ["#FCD589", "#FBC9BC", "#d7e4e4"];

function hashStr(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function getProductTags(product) {
  const seed = hashStr(product.slug || product.title || "");
  const count = 2;
  const tags = [];
  const used = new Set();
  for (let i = 0; i < count; i++) {
    const tagIdx = (seed + i * 7) % TAG_OPTIONS.length;
    let chosen = tagIdx;
    while (used.has(chosen)) {
      chosen = (chosen + 1) % TAG_OPTIONS.length;
    }
    used.add(chosen);
    tags.push({
      label: TAG_OPTIONS[chosen],
      color: TAG_COLORS[(seed + i) % TAG_COLORS.length],
    });
  }
  return tags;
}

// ── Main ───────────────────────────────────────────────────────────────────
const { connectToDatabase, mongoose } = await import(
  "../src/lib/db/mongoose.js"
);
const { Product } = await import("../src/lib/db/models/Product.js");

await connectToDatabase();
console.log(
  `Config: dryRun=${DRY_RUN}  force=${FORCE}  slug=${ONLY_SLUG || "(any)"}\n`
);

const baseFilter = ONLY_SLUG ? { slug: ONLY_SLUG } : {};

let lastId = null;
let processed = 0;
let written = 0;
let skippedExisting = 0;
let skippedSameValues = 0;
let mismatchSamples = [];

while (true) {
  const filter = lastId ? { ...baseFilter, _id: { $gt: lastId } } : baseFilter;
  const page = await Product.find(filter).sort({ _id: 1 }).limit(PAGE);
  if (page.length === 0) break;
  lastId = page[page.length - 1]._id;

  for (const doc of page) {
    processed++;
    const computed = getProductTags({ slug: doc.slug, title: doc.title });
    const existing = (doc.tags || []).map((t) => ({ label: t.label, color: t.color }));

    const sameAsComputed =
      existing.length === computed.length &&
      existing.every(
        (t, i) =>
          t.label === computed[i].label && t.color === computed[i].color
      );

    if (existing.length > 0 && !FORCE) {
      skippedExisting++;
      // Capture a few mismatches so the operator knows when --force would change values
      if (!sameAsComputed && mismatchSamples.length < 5) {
        mismatchSamples.push({
          slug: doc.slug,
          existing,
          computed,
        });
      }
      continue;
    }

    if (sameAsComputed && !FORCE) {
      skippedSameValues++;
      continue;
    }

    if (DRY_RUN) {
      written++;
      if (written <= 10) {
        console.log(
          `[dry] ${doc.slug} → ${computed.map((t) => `${t.label}/${t.color}`).join(", ")}`
        );
      }
      continue;
    }

    doc.tags = computed;
    await doc.save();
    written++;
    if (written <= 10 || written % 100 === 0) {
      console.log(
        `[${written}] ${doc.slug} → ${computed.map((t) => t.label).join(", ")}`
      );
    }
  }

  if (page.length < PAGE) break;
}

console.log("\n─────────────────────────────────");
console.log("  Summary");
console.log("─────────────────────────────────");
console.log(`  Products examined          : ${processed}`);
console.log(`  Tags written               : ${written}`);
console.log(`  Already had identical tags : ${skippedSameValues}`);
console.log(`  Skipped (existing, no force): ${skippedExisting}`);
if (mismatchSamples.length) {
  console.log(
    `\n  ${mismatchSamples.length} product(s) had tags that differ from the computed pair.`
  );
  console.log(`  Re-run with --force to overwrite. Examples:`);
  for (const m of mismatchSamples) {
    console.log(`    ${m.slug}`);
    console.log(`      existing: ${m.existing.map((t) => t.label).join(", ")}`);
    console.log(`      computed: ${m.computed.map((t) => t.label).join(", ")}`);
  }
}
console.log("");

await mongoose.disconnect();
