import { NextResponse } from "next/server";
import { suggestStorefront } from "@/lib/services/storefront-search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/search/suggest?q=<query>
 *
 * Powers the navbar live-search dropdown. Returns a small ranked list
 * of products plus matching categories/subcategories.
 */
export async function GET(request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").slice(0, 200);

  try {
    const data = await suggestStorefront(q);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[search/suggest]", err);
    return NextResponse.json(
      { query: q, productResults: [], categoryResults: [], total: 0 },
      { status: 500 }
    );
  }
}
