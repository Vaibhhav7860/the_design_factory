/**
 * One-shot migration: classify each product's personalisation rule
 * (name = required | optional | hidden) based on its subcategories.
 *
 * The original seed defaulted everything that wasn't a label to
 * `name: "optional"`. That made the storefront render a Personalisation
 * form on products that don't actually need one (e.g. wall clocks,
 * towels) AND let the customer skip it. We've since tightened the rule:
 *
 *   - Subcategory in PERSONALISABLE_SUBCATS  → name: "required"
 *   - Otherwise                              → name: "hidden"
 *
 * This script applies the same logic to existing documents. Idempotent
 * and safe to re-run.
 *
 *   npm run migrate:personalisation -- --dry-run
 *   npm run migrate:personalisation
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

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");

// Authoritative list — must match scripts/seed-demo-data.js.
const PERSONALISABLE_SUBCATS = new Set([
  "name-labels", "round-labels", "rectangular-labels", "mixed-shape-labels",
  "transparent-labels", "iron-on-labels", "iron-on-labels-clothes",
  "school-book-labels", "permanent-waterproof-stickers",
  "3d-embossed-stickers", "back-to-school-label-set",

  "sipper-bottle", "lunch-box", "sketch-book", "rewritable-planners",
  "pencil-case", "school-bag-combos", "ring-folders", "expandable-folders",

  "bag-tags", "bag-tags-adults", "bag-tags-kids",
  "duffle-bags", "jelly-bags", "art-bags", "backpacks", "tote-bags",
  "swimming-bags", "school-bags", "denim-bags", "baby-diaper-bag",

  "3d-gift-tags", "flat-gift-tags", "hanging-gift-tags",
  "money-envelopes", "gift-stationery-sets",
  "3d-gift-tags-adults", "flat-gift-tags-adults", "money-envelopes-adults",
  "gift-stationery-combo-adults", "gift-stationery-combo-kids",

  "bag-combo-set", "school-bag-combo", "organiser-sets",

  "neck-pillow-set", "neck-pillow-combo", "travel-organisers",
  "mix-match-sets", "vanity", "multipurpose-pouches",
  "utility-pouches", "storage-basket",

  "wall-clock", "table-mat", "towel", "table-organiser",
  "cap", "apron-set", "felt-hangings",

  "towels", "towels-adults", "wooden-organisers", "caps", "apron-sets",
  "rakhi", "felt-hangings-buntings", "meal-planner",
]);

const SCHOOL_REQUIRES = new Set([
  "school-book-labels",
  "back-to-school-label-set",
]);

const { connectToDatabase, mongoose } = await import(
  "../src/lib/db/mongoose.js"
);
const { Product } = await import("../src/lib/db/models/Product.js");

await connectToDatabase();

const PAGE = 200;
let lastId = null;
let processed = 0;
let changed = 0;
const transitions = new Map();

while (true) {
  const filter = lastId ? { _id: { $gt: lastId } } : {};
  const page = await Product.find(filter)
    .sort({ _id: 1 })
    .limit(PAGE);
  if (page.length === 0) break;
  lastId = page[page.length - 1]._id;

  for (const doc of page) {
    processed++;
    const subs = Array.isArray(doc.subcategories) ? doc.subcategories : [];
    const personalisable = subs.some((s) => PERSONALISABLE_SUBCATS.has(s));
    const requiresSchool = subs.some((s) => SCHOOL_REQUIRES.has(s));

    const desiredName = personalisable ? "required" : "hidden";
    const desiredSchool = requiresSchool ? "optional" : "hidden";
    const desiredFontSelector = personalisable ? "enabled" : "disabled";
    const desiredFee = personalisable ? 50000 : 0;

    const current = doc.personalisation || {};
    if (
      current.name === desiredName &&
      current.school === desiredSchool &&
      current.fontSelector === desiredFontSelector &&
      (current.additionalFee || 0) === desiredFee
    ) {
      continue;
    }

    const before = current.name || "(unset)";
    const after = desiredName;
    transitions.set(
      `${before} → ${after}`,
      (transitions.get(`${before} → ${after}`) || 0) + 1
    );

    if (!DRY_RUN) {
      doc.personalisation = {
        name: desiredName,
        school: desiredSchool,
        fontSelector: desiredFontSelector,
        additionalFee: desiredFee,
      };
      await doc.save();
    }
    changed++;
  }

  if (page.length < PAGE) break;
}

console.log("─".repeat(50));
console.log(`Processed       : ${processed}`);
console.log(`${DRY_RUN ? "Would change" : "Changed"}        : ${changed}`);
console.log("\nTransitions:");
for (const [k, v] of transitions.entries()) {
  console.log(`  ${k}: ${v}`);
}
console.log("");

await mongoose.disconnect();
