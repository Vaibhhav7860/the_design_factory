/**
 * Storage abstraction.
 *
 * Today: writes uploads to /public/uploads (served by Next.js static).
 * Tomorrow: drop-in Cloudflare R2 implementation that returns
 * https://cdn.thedesignfactory.in/<key> URLs instead.
 *
 * The contract is intentionally small so swapping the backend never touches
 * the components that consume it.
 */
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";

const PUBLIC_UPLOADS = path.join(process.cwd(), "public", "uploads");

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "image/gif",
]);

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

function extFromMime(mime) {
  switch (mime) {
    case "image/jpeg": return ".jpg";
    case "image/png": return ".png";
    case "image/webp": return ".webp";
    case "image/avif": return ".avif";
    case "image/svg+xml": return ".svg";
    case "image/gif": return ".gif";
    default: return ".bin";
  }
}

function sanitizeBase(name) {
  return String(name || "image")
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) || "image";
}

/**
 * Saves a single file (Buffer + mime + originalName) and returns a public URL.
 *
 * Result shape:
 *   { key: "products/<hash>/<name>.png", url: "/uploads/products/<hash>/<name>.png" }
 *
 * For the local backend, `url` is the path Next.js serves directly.
 * When we swap to R2, `url` becomes `${MEDIA_CDN_URL}/${key}` and the file
 * is uploaded to the bucket instead of disk.
 */
export async function saveUpload({ buffer, mime, originalName, prefix = "products" }) {
  if (!buffer || !mime) {
    throw new Error("Missing file payload");
  }
  if (!ALLOWED_MIME.has(mime)) {
    throw new Error(`Unsupported file type: ${mime}`);
  }
  if (buffer.length > MAX_BYTES) {
    throw new Error("File exceeds the 25 MB limit");
  }

  const hash = crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 12);
  const base = sanitizeBase(originalName);
  const ext = extFromMime(mime);
  const filename = `${base}${ext}`;
  const key = `${prefix}/${hash}/${filename}`;

  // ── Local backend ──
  const fullPath = path.join(PUBLIC_UPLOADS, prefix, hash, filename);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  // Avoid rewriting if same content already on disk
  try {
    const existing = await fs.stat(fullPath);
    if (existing.size !== buffer.length) {
      await fs.writeFile(fullPath, buffer);
    }
  } catch {
    await fs.writeFile(fullPath, buffer);
  }

  return {
    key,
    url: `/uploads/${key}`,
    bytes: buffer.length,
    mime,
  };
}

/**
 * Convenience: take the FormData entries called `images` from a Request and
 * persist each one. Returns an array of saved upload descriptors.
 */
export async function saveFormDataImages(formData, fieldName = "images") {
  const items = formData.getAll(fieldName).filter((v) => v && typeof v !== "string");
  const results = [];
  for (const file of items) {
    const buf = Buffer.from(await file.arrayBuffer());
    const saved = await saveUpload({
      buffer: buf,
      mime: file.type,
      originalName: file.name,
    });
    results.push(saved);
  }
  return results;
}

export const STORAGE_LIMITS = {
  maxBytes: MAX_BYTES,
  allowedMime: Array.from(ALLOWED_MIME),
};
