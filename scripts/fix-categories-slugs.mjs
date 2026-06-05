import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

for (const file of [".env.local", ".env.development", ".env"]) {
  const full = path.join(projectRoot, file);
  if (fs.existsSync(full)) dotenv.config({ path: full, override: false });
}

const { connectToDatabase, mongoose } = await import("../src/lib/db/mongoose.js");
const { Product } = await import("../src/lib/db/models/Product.js");

function slugify(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function run() {
  await connectToDatabase();
  console.log("Connected to DB.");

  const products = await Product.find({});
  let updated = 0;

  const bulkOps = [];
  for (const p of products) {
    let changed = false;
    
    const newCats = (p.categories || []).map(c => slugify(c));
    const newSubcats = (p.subcategories || []).map(c => slugify(c));

    // Check if they differ
    if (JSON.stringify(p.categories) !== JSON.stringify(newCats)) changed = true;
    if (JSON.stringify(p.subcategories) !== JSON.stringify(newSubcats)) changed = true;

    if (changed) {
      bulkOps.push({
        updateOne: {
          filter: { _id: p._id },
          update: {
            $set: {
              categories: newCats,
              subcategories: newSubcats
            }
          }
        }
      });
      updated++;
    }
  }

  if (bulkOps.length > 0) {
    console.log(`Executing ${bulkOps.length} bulk updates...`);
    // Execute in batches of 100
    const BATCH_SIZE = 100;
    for (let i = 0; i < bulkOps.length; i += BATCH_SIZE) {
      const batch = bulkOps.slice(i, i + BATCH_SIZE);
      await Product.bulkWrite(batch, { ordered: false });
    }
    console.log(`Done updating ${updated} products.`);
  } else {
    console.log("All products already have slugified categories.");
  }

  await mongoose.disconnect();
}

run().catch(console.error);
