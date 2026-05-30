/**
 * Server-only storefront product service.
 *
 * Every storefront page that needs product data should import from here
 * (NOT from `@/data/products`, which is a deprecated static dump).
 *
 * Multi-category support
 * ──────────────────────
 * A product's `categories` and `subcategories` are arrays in MongoDB.
 * `getProductsByCategory("bags")` returns every product whose
 * categories array CONTAINS "bags" — so a product like
 * "School Book Labels" that lives in both "labels" and "school-essentials"
 * shows up under both.
 *
 * Active-only by default
 * ──────────────────────
 * All lookups filter by `status: "active"` so drafts/archived products
 * never leak onto the storefront.
 *
 * Output shape
 * ────────────
 * Mongo stores prices in paise; the storefront uses rupees throughout.
 * `serialiseProduct` converts to a plain object the storefront can use
 * directly — the same shape it used to get from `@/data/products`,
 * plus a few extra fields (id, discountPercent, tags array of objects).
 */

import { connectToDatabase } from "../db/mongoose.js";
import { Product } from "../db/models/Product.js";

const ACTIVE_FILTER = { status: "active" };

/**
 * Convert a lean Mongoose product document to a plain JSON-safe object
 * with all the fields the storefront components expect.
 */
export function serialiseProduct(p) {
  if (!p) return null;
  const priceRupees = Math.round((p.price ?? 0)) / 100;
  const originalPriceRupees =
    p.originalPrice != null ? Math.round(p.originalPrice) / 100 : null;
  return {
    id: String(p._id),
    slug: p.slug,
    title: p.title,
    description: p.description || "",
    categories: Array.isArray(p.categories) ? p.categories : [],
    subcategories: Array.isArray(p.subcategories) ? p.subcategories : [],
    badge: p.badge || null,
    badgeStyle: p.badgeStyle || null,
    price: priceRupees,
    originalPrice: originalPriceRupees ?? priceRupees,
    discountPercent: p.discountPercent ?? 0,
    images: Array.isArray(p.images) ? p.images.filter(Boolean) : [],
    image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null,
    tags: Array.isArray(p.tags)
      ? p.tags.map((t) => ({ label: t.label, color: t.color }))
      : [],
    personalisation: p.personalisation
      ? {
          name: p.personalisation.name || "optional",
          school: p.personalisation.school || "hidden",
          fontSelector: p.personalisation.fontSelector || "enabled",
          additionalFee: (p.personalisation.additionalFee ?? 0) / 100,
        }
      : null,
    status: p.status || "draft",
  };
}

// ─────────────────────────────────────────────────────────────────────
// Lookups
// ─────────────────────────────────────────────────────────────────────

/**
 * Returns every active product. Used by `make-combo`,
 * `review-uncategorized`, and homepage feature pickers.
 */
export async function getAllProducts() {
  await connectToDatabase();
  const docs = await Product.find(ACTIVE_FILTER).sort({ title: 1 }).lean();
  return docs.map(serialiseProduct);
}

export async function getProductBySlug(slug) {
  if (!slug) return null;
  await connectToDatabase();
  const doc = await Product.findOne({ ...ACTIVE_FILTER, slug }).lean();
  return doc ? serialiseProduct(doc) : null;
}

/**
 * Look up a fixed list of slugs in one query, preserving the input
 * order so featured-product carousels keep their curated sequence.
 */
export async function getProductsBySlugs(slugs = []) {
  const list = (slugs || []).filter(Boolean);
  if (list.length === 0) return [];
  await connectToDatabase();
  const docs = await Product.find({ ...ACTIVE_FILTER, slug: { $in: list } }).lean();
  const bySlug = new Map(docs.map((d) => [d.slug, d]));
  return list.map((s) => bySlug.get(s)).filter(Boolean).map(serialiseProduct);
}

/**
 * All products belonging to the given category. Uses array-membership
 * semantics so a product can appear in multiple categories.
 */
export async function getProductsByCategory(categorySlug) {
  if (!categorySlug) return [];
  await connectToDatabase();
  const docs = await Product.find({
    ...ACTIVE_FILTER,
    categories: categorySlug,
  })
    .sort({ updatedAt: -1 })
    .lean();
  return docs.map(serialiseProduct);
}

/**
 * Products that belong to BOTH the given category AND the given
 * subcategory. Same multi-list semantics as above.
 */
export async function getProductsBySubcategory(categorySlug, subcategorySlug) {
  if (!categorySlug || !subcategorySlug) return [];
  await connectToDatabase();
  const docs = await Product.find({
    ...ACTIVE_FILTER,
    categories: categorySlug,
    subcategories: subcategorySlug,
  })
    .sort({ updatedAt: -1 })
    .lean();
  return docs.map(serialiseProduct);
}

/**
 * Products that share at least one category with the given product.
 * Excludes the product itself. Used on the product detail page.
 */
export async function getRelatedProducts(productSlug, limit = 8) {
  if (!productSlug) return [];
  await connectToDatabase();
  const doc = await Product.findOne({ slug: productSlug })
    .select("categories")
    .lean();
  const cats = doc?.categories || [];
  const filter = cats.length
    ? { ...ACTIVE_FILTER, slug: { $ne: productSlug }, categories: { $in: cats } }
    : { ...ACTIVE_FILTER, slug: { $ne: productSlug } };
  const docs = await Product.find(filter)
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();
  return docs.map(serialiseProduct);
}

/**
 * Distinct category slugs that have at least one active product. Used
 * by debug surfaces; the menu uses the static taxonomy.
 */
export async function getAllCategories() {
  await connectToDatabase();
  return Product.distinct("categories", ACTIVE_FILTER);
}

/**
 * Distinct subcategory slugs that have at least one active product
 * inside a given category.
 */
export async function getAllSubcategories(categorySlug) {
  if (!categorySlug) return [];
  await connectToDatabase();
  return Product.distinct("subcategories", {
    ...ACTIVE_FILTER,
    categories: categorySlug,
  });
}
