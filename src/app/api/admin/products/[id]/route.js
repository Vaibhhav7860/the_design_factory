import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { adminRoute, requirePermission } from "@/lib/auth/permissions";
import {
  saveFormDataImages,
  folderFromTitle,
  inferFolderFromImageUrls,
} from "@/lib/storage";
import {
  getProductById,
  updateProduct,
} from "@/lib/services/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/products/:id — fetch a single product (used by edit page).
 */
export const GET = adminRoute(async (_request, { params }) => {
  await requirePermission("products.read");
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ product });
});

/**
 * PUT /api/admin/products/:id — update a product.
 */
export const PUT = adminRoute(async (request, { params }) => {
  await requirePermission("products.write");
  const { id } = await params;

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data" },
      { status: 400 }
    );
  }

  const payloadRaw = formData.get("payload");
  if (!payloadRaw || typeof payloadRaw !== "string") {
    return NextResponse.json({ error: "Missing 'payload' field" }, { status: 400 });
  }

  let payload;
  try {
    payload = JSON.parse(payloadRaw);
  } catch {
    return NextResponse.json(
      { error: "'payload' is not valid JSON" },
      { status: 400 }
    );
  }

  // Look up the existing product so we can pick a folder for any new
  // image uploads. Order of preference:
  //   1. Folder of the existing images (so renames don't split them)
  //   2. The new title (when admin sent one in this update)
  //   3. The current title on the document
  const existing = await getProductById(id);
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const inferredFolder = inferFolderFromImageUrls(existing.images);
  const titleForFolder = payload.title || existing.title;
  const folderPath = inferredFolder || `products/${folderFromTitle(titleForFolder)}`;

  // Persist any newly-uploaded images
  let savedUploads = [];
  try {
    savedUploads = await saveFormDataImages(formData, "images", {
      folder: folderPath,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Image upload failed" },
      { status: 400 }
    );
  }
  const newImageUrls = savedUploads.map((u) => u.url);

  // Existing images the admin chose to keep (already a URL/path)
  const keepImages = Array.isArray(payload.keepImages)
    ? payload.keepImages.filter((u) => typeof u === "string" && u.length)
    : [];

  // Final ordering: kept (in user's order) followed by newly uploaded (also
  // in upload order). Caller can interleave by reordering before submit.
  const finalImages = Array.isArray(payload.imagesOrder)
    ? payload.imagesOrder
    : [...keepImages, ...newImageUrls];

  // Only set `images` if the admin actually touched the gallery
  const updateInput = { ...payload };
  delete updateInput.keepImages;
  delete updateInput.imagesOrder;

  if (
    keepImages.length > 0 ||
    newImageUrls.length > 0 ||
    Array.isArray(payload.imagesOrder)
  ) {
    // Merge upload URLs into placeholders inside imagesOrder, if used
    if (Array.isArray(payload.imagesOrder)) {
      let uploadIdx = 0;
      updateInput.images = payload.imagesOrder.map((entry) => {
        if (entry === "__NEW__") return newImageUrls[uploadIdx++];
        return entry;
      });
    } else {
      updateInput.images = finalImages;
    }
  }

  let product;
  try {
    product = await updateProduct(id, updateInput);
  } catch (err) {
    if (err?.code === "INVALID_ID" || err?.code === "NOT_FOUND") {
      return NextResponse.json(
        { error: err.message },
        { status: err.code === "NOT_FOUND" ? 404 : 400 }
      );
    }
    if (err?.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", issues: err.issues },
        { status: 400 }
      );
    }
    console.error("[admin/products PUT]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  // Revalidate storefront caches
  try {
    revalidateTag("storefront:products");
    revalidateTag(`storefront:product:${product.slug}`);
    for (const cat of product.categories || []) {
      revalidateTag(`storefront:category:${cat}`);
    }
  } catch {
    /* non-blocking */
  }

  return NextResponse.json({ product });
});
