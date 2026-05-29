import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { adminRoute, requirePermission } from "@/lib/auth/permissions";
import { saveFormDataImages } from "@/lib/storage";
import { createProduct } from "@/lib/services/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = adminRoute(async (request) => {
  await requirePermission("products.write");

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data" },
      { status: 400 }
    );
  }

  // Parse the JSON metadata blob
  const payloadRaw = formData.get("payload");
  if (!payloadRaw || typeof payloadRaw !== "string") {
    return NextResponse.json(
      { error: "Missing 'payload' field" },
      { status: 400 }
    );
  }

  let payload;
  try {
    payload = JSON.parse(payloadRaw);
  } catch {
    return NextResponse.json({ error: "'payload' is not valid JSON" }, { status: 400 });
  }

  // Persist uploaded images to disk (Cloudflare R2 will plug in here later)
  let savedUploads = [];
  try {
    savedUploads = await saveFormDataImages(formData, "images");
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Image upload failed" },
      { status: 400 }
    );
  }

  const imageUrls = savedUploads.map((u) => u.url);

  // Allow callers to also pass externally-hosted image URLs (e.g. legacy
  // Shopify CDN entries during migration).
  const externalImages = Array.isArray(payload.externalImages)
    ? payload.externalImages.filter(
        (u) => typeof u === "string" && /^https?:\/\//.test(u)
      )
    : [];

  const productInput = {
    ...payload,
    images: [...imageUrls, ...externalImages],
  };

  let product;
  try {
    product = await createProduct(productInput);
  } catch (err) {
    if (err?.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", issues: err.issues },
        { status: 400 }
      );
    }
    if (err?.code === "DUPLICATE_SLUG") {
      return NextResponse.json(
        { error: err.message, field: err.field },
        { status: 409 }
      );
    }
    if (err?.code === 11000) {
      return NextResponse.json(
        { error: "A product with this slug already exists", field: "slug" },
        { status: 409 }
      );
    }
    console.error("[admin/products POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  // Revalidate the storefront pages this product affects
  try {
    revalidateTag("storefront:products");
    revalidateTag(`storefront:product:${product.slug}`);
    for (const cat of product.categories || []) {
      revalidateTag(`storefront:category:${cat}`);
    }
  } catch {
    /* non-blocking */
  }

  return NextResponse.json(
    {
      product: {
        id: String(product._id),
        slug: product.slug,
        title: product.title,
        status: product.status,
      },
    },
    { status: 201 }
  );
});
