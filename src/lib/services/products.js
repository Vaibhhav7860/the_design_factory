import { z } from "zod";
import mongoose from "mongoose";
import { connectToDatabase } from "../db/mongoose.js";
import { Product } from "../db/models/Product.js";
import { CATEGORY_SLUGS, TAG_COLORS } from "../data/categories-taxonomy.js";

/**
 * Returns true when an image URL is hosted somewhere we don't control —
 * i.e. it's a leftover Shopify CDN URL from the imported catalog and we
 * still need to re-host it. URLs on our own CDN (MEDIA_CDN_URL) or local
 * `/uploads/` paths don't count.
 */
function isExternalAsset(url) {
  if (typeof url !== "string") return false;
  // Local-served paths from the dev fallback storage backend
  if (url.startsWith("/uploads/")) return false;
  if (!/^https?:\/\//i.test(url)) return false;
  const cdn = process.env.MEDIA_CDN_URL;
  if (cdn && url.startsWith(cdn.replace(/\/+$/, ""))) return false;
  return true;
}

const TagInput = z.object({
  label: z.string().trim().min(1).max(40),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export const ProductCreateSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .max(200)
      .regex(/^[a-z0-9-]+$/, "Slug must use lowercase letters, digits and hyphens only")
      .optional(),
    description: z.string().max(50000).default(""),
    categories: z
      .array(z.enum(CATEGORY_SLUGS))
      .min(1, "Pick at least one category")
      .max(9),
    subcategories: z.array(z.string().trim().max(80)).default([]),
    originalPrice: z.coerce.number().int().min(0).max(9999999), // paise
    price: z.coerce.number().int().min(0).max(9999999), // paise
    images: z.array(z.string().min(1)).default([]),
    tags: z.array(TagInput).max(8).default([]),
    status: z.enum(["active", "draft", "archived"]).default("active"),
    badge: z.string().trim().max(40).optional(),

    // Inventory tracked on a single default variant
    sku: z.string().trim().max(60).optional(),
    inventory: z.coerce.number().int().min(0).max(999999).default(0),
    lowStockThreshold: z.coerce.number().int().min(0).max(999999).default(5),
  })
  .superRefine((val, ctx) => {
    if (val.originalPrice && val.price > val.originalPrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Discounted price cannot exceed mark price",
        path: ["price"],
      });
    }
  });

/**
 * Update payload — every field except slug is optional. Slug is intentionally
 * locked once the product is live so existing storefront URLs don't break.
 */
export const ProductUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().max(50000).optional(),
    categories: z
      .array(z.enum(CATEGORY_SLUGS))
      .min(1, "Pick at least one category")
      .max(9)
      .optional(),
    subcategories: z.array(z.string().trim().max(80)).optional(),
    originalPrice: z.coerce.number().int().min(0).max(9999999).optional(),
    price: z.coerce.number().int().min(0).max(9999999).optional(),
    images: z.array(z.string().min(1)).optional(),
    tags: z.array(TagInput).max(8).optional(),
    status: z.enum(["active", "draft", "archived"]).optional(),
    badge: z.string().trim().max(40).optional(),

    sku: z.string().trim().max(60).optional(),
    inventory: z.coerce.number().int().min(0).max(999999).optional(),
    lowStockThreshold: z.coerce.number().int().min(0).max(999999).optional(),
    trackInventory: z.boolean().optional(),
  })
  .superRefine((val, ctx) => {
    const op = val.originalPrice;
    const p = val.price;
    if (op !== undefined && p !== undefined && p > op) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Discounted price cannot exceed mark price",
        path: ["price"],
      });
    }
  });

export function slugify(input = "") {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 200);
}

export async function generateUniqueSlug(base) {
  await connectToDatabase();
  let candidate = slugify(base);
  if (!candidate) candidate = `product-${Date.now()}`;

  let suffix = 0;
  while (true) {
    const trial = suffix === 0 ? candidate : `${candidate}-${suffix}`;
    const existing = await Product.findOne({ slug: trial }).select("_id").lean();
    if (!existing) return trial;
    suffix += 1;
    if (suffix > 50) {
      // fallback to a hashed suffix to guarantee termination
      return `${candidate}-${Date.now().toString(36).slice(-6)}`;
    }
  }
}

/**
 * Create a Product from validated payload. Auto-generates a unique slug if
 * none provided. Computes discountPercent automatically (also done in
 * the Mongoose pre-save hook as a defence-in-depth).
 */
export async function createProduct(input) {
  await connectToDatabase();

  const parsed = ProductCreateSchema.parse(input);
  const slug = parsed.slug || (await generateUniqueSlug(parsed.title));

  // Validate slug uniqueness when caller passed one
  if (parsed.slug) {
    const exists = await Product.findOne({ slug }).select("_id").lean();
    if (exists) {
      const err = new Error("A product with this slug already exists");
      err.code = "DUPLICATE_SLUG";
      err.field = "slug";
      throw err;
    }
  }

  const discountPercent =
    parsed.originalPrice > parsed.price && parsed.originalPrice > 0
      ? Math.round(((parsed.originalPrice - parsed.price) / parsed.originalPrice) * 100)
      : 0;

  // Auto-generate the SKU from the slug if not provided
  const sku = (parsed.sku?.trim() || `${slug}-DEFAULT`).toUpperCase().slice(0, 60);

  // Every product has at least one default variant carrying its inventory.
  const defaultVariant = {
    sku,
    options: { Default: "Default" },
    price: parsed.price,
    inventory: parsed.inventory,
    weightGrams: 0,
    lowStockThreshold: parsed.lowStockThreshold,
    inLowStockState: parsed.inventory <= parsed.lowStockThreshold,
  };

  const doc = await Product.create({
    title: parsed.title,
    slug,
    description: parsed.description || "",
    categories: parsed.categories,
    subcategories: parsed.subcategories,
    badge: parsed.badge,
    price: parsed.price,
    originalPrice: parsed.originalPrice,
    discountPercent,
    images: parsed.images,
    tags: parsed.tags,
    status: parsed.status,
    variants: [defaultVariant],
    needsAssetMigration: parsed.images.some(isExternalAsset),
    seo: {
      title: parsed.title.slice(0, 70),
      description: (parsed.description || "").slice(0, 160),
      slug,
    },
  });

  return doc.toObject();
}

/**
 * Fetch a single product by ObjectId. Returns null if not found.
 */
export async function getProductById(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectToDatabase();
  const doc = await Product.findById(id).lean();
  return doc ? serialiseProduct(doc) : null;
}

/**
 * Update a product. The update payload mirrors the create payload but every
 * field is optional. Inventory + SKU are written onto the FIRST variant
 * (which the create flow guarantees exists).
 */
export async function updateProduct(id, input) {
  if (!mongoose.isValidObjectId(id)) {
    const err = new Error("Invalid product id");
    err.code = "INVALID_ID";
    throw err;
  }
  await connectToDatabase();

  const parsed = ProductUpdateSchema.parse(input);

  const doc = await Product.findById(id);
  if (!doc) {
    const err = new Error("Product not found");
    err.code = "NOT_FOUND";
    throw err;
  }

  // ── Top-level fields ──
  if (parsed.title !== undefined) doc.title = parsed.title;
  if (parsed.description !== undefined) doc.description = parsed.description;
  if (parsed.categories !== undefined) doc.categories = parsed.categories;
  if (parsed.subcategories !== undefined) doc.subcategories = parsed.subcategories;
  if (parsed.badge !== undefined) doc.badge = parsed.badge;
  if (parsed.tags !== undefined) doc.tags = parsed.tags;
  if (parsed.status !== undefined) doc.status = parsed.status;

  if (parsed.images !== undefined) {
    doc.images = parsed.images;
    doc.needsAssetMigration = parsed.images.some(isExternalAsset);
  }

  // Pricing — compute the final pair using whichever values are present
  const nextOriginalPrice =
    parsed.originalPrice !== undefined ? parsed.originalPrice : doc.originalPrice;
  const nextPrice = parsed.price !== undefined ? parsed.price : doc.price;
  if (parsed.originalPrice !== undefined) doc.originalPrice = nextOriginalPrice;
  if (parsed.price !== undefined) doc.price = nextPrice;
  if (parsed.originalPrice !== undefined || parsed.price !== undefined) {
    doc.discountPercent =
      nextOriginalPrice > nextPrice && nextOriginalPrice > 0
        ? Math.round(((nextOriginalPrice - nextPrice) / nextOriginalPrice) * 100)
        : 0;
  }

  // ── Variant: inventory + SKU live on the first variant ──
  if (
    parsed.sku !== undefined ||
    parsed.inventory !== undefined ||
    parsed.lowStockThreshold !== undefined ||
    parsed.price !== undefined
  ) {
    let variant = doc.variants?.[0];
    if (!variant) {
      // Defensive: ensure one variant always exists.
      doc.variants.push({
        sku: (parsed.sku?.trim() || `${doc.slug}-DEFAULT`).toUpperCase().slice(0, 60),
        options: { Default: "Default" },
        price: nextPrice ?? 0,
        inventory: parsed.inventory ?? 0,
        weightGrams: 0,
        lowStockThreshold: parsed.lowStockThreshold ?? 5,
        inLowStockState: false,
      });
      variant = doc.variants[0];
    } else {
      if (parsed.sku !== undefined) {
        variant.sku =
          (parsed.sku.trim() || `${doc.slug}-DEFAULT`)
            .toUpperCase()
            .slice(0, 60);
      }
      if (parsed.inventory !== undefined) variant.inventory = parsed.inventory;
      if (parsed.lowStockThreshold !== undefined) {
        variant.lowStockThreshold = parsed.lowStockThreshold;
      }
      if (parsed.price !== undefined) variant.price = nextPrice;

      const inv = variant.inventory ?? 0;
      const thr = variant.lowStockThreshold ?? 0;
      variant.inLowStockState = inv <= thr;
    }
  }

  // Keep SEO snapshot in sync if title or description changed
  if (parsed.title !== undefined) {
    doc.seo = doc.seo || {};
    doc.seo.title = parsed.title.slice(0, 70);
  }
  if (parsed.description !== undefined) {
    doc.seo = doc.seo || {};
    doc.seo.description = parsed.description.slice(0, 160);
  }

  await doc.save();
  return serialiseProduct(doc.toObject());
}

/**
 * Convert lean Mongoose objects to plain JSON-safe objects suitable for
 * Server → Client component prop passing.
 */
export function serialiseProduct(p) {
  if (!p) return null;
  return {
    id: String(p._id),
    title: p.title || "",
    slug: p.slug,
    description: p.description || "",
    categories: p.categories || [],
    subcategories: p.subcategories || [],
    badge: p.badge || "",
    price: p.price ?? 0,
    originalPrice: p.originalPrice ?? p.price ?? 0,
    discountPercent: p.discountPercent ?? 0,
    images: p.images || [],
    tags: (p.tags || []).map((t) => ({
      label: t.label,
      color: t.color,
    })),
    status: p.status || "draft",
    variants: (p.variants || []).map((v) => ({
      id: String(v._id),
      sku: v.sku,
      price: v.price ?? 0,
      inventory: v.inventory ?? 0,
      lowStockThreshold: v.lowStockThreshold ?? 5,
      inLowStockState: !!v.inLowStockState,
    })),
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : null,
  };
}

/**
 * Public list of valid tag colours for the admin UI.
 */
export function tagColorOptions() {
  return TAG_COLORS;
}
