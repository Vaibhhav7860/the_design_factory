import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { CATEGORIES } from "../src/lib/data/categories-taxonomy.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function verifyTaxonomy() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    // Create a set of valid categories and subcategories from taxonomy
    const validCategories = new Set();
    const validSubcategoriesByCategory = {};
    const validSubcategories = new Set();

    for (const cat of CATEGORIES) {
      validCategories.add(cat.slug);
      validSubcategoriesByCategory[cat.slug] = new Set();
      for (const sub of cat.subcategories) {
        validSubcategoriesByCategory[cat.slug].add(sub.slug);
        validSubcategories.add(sub.slug);
      }
    }

    const prods = await db.collection('products').find({}).toArray();
    
    const invalidCategories = {};
    const invalidSubcategories = {};
    
    for (const p of prods) {
      if (!p.categories) continue;
      
      for (const cat of p.categories) {
        if (!validCategories.has(cat)) {
          invalidCategories[cat] = (invalidCategories[cat] || 0) + 1;
        } else {
          // If category is valid, check if subcategories are valid for THIS category
          // Wait, Mongoose stores subcategories in a flat array, not tied to a specific category.
          // We just check if the subcategory exists anywhere, or specifically within the categories this product has.
          if (p.subcategories) {
            for (const sub of p.subcategories) {
              // A subcategory is valid if it exists under ANY of the product's valid categories
              let isValidForProduct = false;
              for (const pc of p.categories) {
                if (validSubcategoriesByCategory[pc] && validSubcategoriesByCategory[pc].has(sub)) {
                  isValidForProduct = true;
                  break;
                }
              }
              if (!isValidForProduct) {
                const key = `${cat} -> ${sub}`;
                invalidSubcategories[key] = (invalidSubcategories[key] || 0) + 1;
              }
            }
          }
        }
      }
    }

    console.log("=== Discrepancies Found ===");
    console.log("Invalid/Missing Categories:", invalidCategories);
    console.log("Invalid/Missing Subcategories by Category:", invalidSubcategories);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

verifyTaxonomy();
