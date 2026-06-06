import { NextResponse } from "next/server";
import { adminRoute, requirePermission, requireSession } from "@/lib/auth/permissions";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ContentBlock } from "@/lib/db/models/ContentBlock";
import { saveMediaUpload } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CAROUSEL_KEY = "hero-carousel";

export const GET = adminRoute(async () => {
  await requireSession();
  await connectToDatabase();
  const block = await ContentBlock.findOne({ key: CAROUSEL_KEY }).lean();
  return NextResponse.json({ block: block ?? null });
});

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
      folder: "carousel",
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const isLocal = saved.backend === "local";
  return NextResponse.json({ url: saved.url, key: saved.key, isLocal });
});

export const PUT = adminRoute(async (request) => {
  await requirePermission("content.write");

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { mediaType, slides } = body;

  if (!["video", "image"].includes(mediaType)) {
    return NextResponse.json({ error: "mediaType must be 'video' or 'image'" }, { status: 400 });
  }
  if (!Array.isArray(slides)) {
    return NextResponse.json({ error: "slides must be an array" }, { status: 400 });
  }

  const cleanSlides = slides.map((s) => ({
    url: String(s.url ?? ""),
    key: String(s.key ?? ""),
    name: String(s.name ?? ""),
  }));

  await connectToDatabase();
  const block = await ContentBlock.findOneAndUpdate(
    { key: CAROUSEL_KEY },
    {
      $set: {
        key: CAROUSEL_KEY,
        title: "Hero Carousel",
        data: { mediaType, slides: cleanSlides },
      },
    },
    { upsert: true, new: true }
  );

  return NextResponse.json({ block });
});