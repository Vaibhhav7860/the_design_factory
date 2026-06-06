import { NextResponse } from "next/server";
import { adminRoute, requirePermission, requireSession } from "@/lib/auth/permissions";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ContentBlock } from "@/lib/db/models/ContentBlock";
import { saveMediaUpload } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INSTAGRAM_KEY = "instagram-community";

export const GET = adminRoute(async () => {
  await requireSession();
  await connectToDatabase();
  const block = await ContentBlock.findOne({ key: INSTAGRAM_KEY }).lean();
  return NextResponse.json({ block: block ?? null });
});

// Upload a single cover image for an Instagram card.
export const POST = adminRoute(async (request) => {
  await requirePermission("content.write");

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  let buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer());
  } catch {
    return NextResponse.json({ error: "Failed to read file" }, { status: 400 });
  }

  let saved;
  try {
    saved = await saveMediaUpload({
      buffer,
      mime: file.type,
      originalName: file.name,
      folder: "instagram",
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const isLocal = saved.backend === "local";
  return NextResponse.json({ url: saved.url, key: saved.key, isLocal });
});

// Persist the full ordered list of Instagram cards.
export const PUT = adminRoute(async (request) => {
  await requirePermission("content.write");

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { cards } = body;
  if (!Array.isArray(cards)) {
    return NextResponse.json({ error: "cards must be an array" }, { status: 400 });
  }

  const cleanCards = cards
    .map((c) => ({
      url: String(c.url ?? "").trim(),
      key: String(c.key ?? "").trim(),
      href: String(c.href ?? "").trim(),
      name: String(c.name ?? "").trim(),
      isLocal: Boolean(c.isLocal),
    }))
    // A card is only meaningful with a cover image.
    .filter((c) => c.url);

  await connectToDatabase();
  const block = await ContentBlock.findOneAndUpdate(
    { key: INSTAGRAM_KEY },
    {
      $set: {
        key: INSTAGRAM_KEY,
        title: "Instagram Community",
        data: { cards: cleanCards },
      },
    },
    { upsert: true, new: true }
  );

  return NextResponse.json({ block });
});
