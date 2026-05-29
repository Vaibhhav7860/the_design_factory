import { adminRoute, requirePermission } from "@/lib/auth/permissions";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Product } from "@/lib/db/models";
import { textFilter } from "@/lib/pagination";
import { parseExportRange } from "@/lib/exportRange";
import { toCSV, csvResponse } from "@/lib/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLUMNS = [
  { key: "id", header: "Product ID" },
  { key: "title", header: "Title" },
  { key: "slug", header: "Slug" },
  { key: "status", header: "Status" },
  { key: "categories", header: "Categories", format: (v) => (v || []).join("; ") },
  { key: "subcategories", header: "Subcategories", format: (v) => (v || []).join("; ") },
  { key: "originalPriceINR", header: "Mark Price (INR)" },
  { key: "priceINR", header: "Discounted Price (INR)" },
  { key: "discountPercent", header: "Discount %" },
  { key: "sku", header: "Default SKU" },
  { key: "inventory", header: "Inventory" },
  { key: "lowStockThreshold", header: "Low-stock threshold" },
  { key: "tags", header: "Tags", format: (v) => (v || []).map((t) => t.label).join("; ") },
  { key: "imageCount", header: "Image count" },
  { key: "createdAt", header: "Created" },
  { key: "updatedAt", header: "Updated" },
];

export const GET = adminRoute(async (request) => {
  await requirePermission("products.read");
  const url = new URL(request.url);
  const sp = Object.fromEntries(url.searchParams);
  const { skip, limit, q } = parseExportRange(sp);

  await connectToDatabase();

  const filter = textFilter(q, ["title", "slug"]) ?? {};
  const docs = await Product.find(filter)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const rows = docs.map((p) => {
    const variant = p.variants?.[0] || {};
    return {
      id: String(p._id),
      title: p.title || "",
      slug: p.slug || "",
      status: p.status || "",
      categories: p.categories || [],
      subcategories: p.subcategories || [],
      originalPriceINR: ((p.originalPrice ?? p.price ?? 0) / 100).toFixed(2),
      priceINR: ((p.price ?? 0) / 100).toFixed(2),
      discountPercent: p.discountPercent ?? 0,
      sku: variant.sku || "",
      inventory: variant.inventory ?? 0,
      lowStockThreshold: variant.lowStockThreshold ?? 0,
      tags: p.tags || [],
      imageCount: (p.images || []).length,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  });

  const csv = toCSV(COLUMNS, rows);
  return csvResponse(csv, "products_Export.csv");
});
