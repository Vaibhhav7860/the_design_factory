/**
 * Storage abstraction.
 *
 * Backend is picked at runtime from environment configuration:
 *
 *   R2 (production):
 *     R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 *     R2_BUCKET, R2_ENDPOINT (optional, default derived from account id),
 *     MEDIA_CDN_URL (the public URL prefix served by Cloudflare CDN, with
 *       no trailing slash; e.g. https://thedesignfactoryshop.com)
 *
 *   Local (development fallback):
 *     none of the R2_ vars set — saves to /public/uploads instead.
 *
 *   const saved = await saveUpload({
 *     buffer, mime, originalName,
 *     folder: "products/<product-slug>",   // optional, defaults to "products"
 *   });
 *   // { key, url, bytes, mime, backend, deduped? }
 *
 * Layout produced on R2:
 *   products/<product-slug>/<base-name>-<sha8>.<ext>
 *
 * One folder per product. The 8-char content hash is appended to the
 * filename so re-uploading the same picture twice doesn't create a
 * duplicate, and uploading a different picture with the same source
 * filename doesn't overwrite the first one.
 */
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "image/gif",
]);

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

const PUBLIC_UPLOADS = path.join(process.cwd(), "public", "uploads");

// ─────────────────────────────────────────────────────────────
// Backend selection
// ─────────────────────────────────────────────────────────────

function r2EnvIsConfigured() {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET
  );
}

let _s3 = null;
async function getS3Client() {
  if (_s3) return _s3;
  const { S3Client } = await import("@aws-sdk/client-s3");
  const endpoint =
    process.env.R2_ENDPOINT ||
    `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  _s3 = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });
  return _s3;
}

function publicUrlForKey(key) {
  const cdn = process.env.MEDIA_CDN_URL;
  if (cdn) return `${cdn.replace(/\/+$/, "")}/${key}`;
  const endpoint =
    process.env.R2_ENDPOINT ||
    `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  return `${endpoint.replace(/\/+$/, "")}/${process.env.R2_BUCKET}/${key}`;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function extFromMime(mime) {
  switch (mime) {
    case "image/jpeg": return ".jpg";
    case "image/png":  return ".png";
    case "image/webp": return ".webp";
    case "image/avif": return ".avif";
    case "image/svg+xml": return ".svg";
    case "image/gif":  return ".gif";
    default:           return ".bin";
  }
}

function sanitizeBase(name) {
  return (
    String(name || "image")
      .toLowerCase()
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60) || "image"
  );
}

/**
 * Sanitise a folder path supplied by the caller.
 *
 * Splits on `/` so the caller can pass nested paths, then removes only
 * characters that are unsafe in S3 / R2 keys. We deliberately KEEP spaces,
 * ampersands, and capital letters so titles like "Towels & Wraps" survive
 * and remain readable in the Cloudflare bucket UI.
 */
function sanitizeFolder(folder) {
  if (!folder) return "products";
  const segments = String(folder)
    .split("/")
    .map((s) =>
      s
        // Strip control chars + the few characters S3 forbids or that
        // commonly cause trouble in URLs.
        // eslint-disable-next-line no-control-regex
        .replace(/[\x00-\x1F\x7F"`<>|*?\\]+/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 100)
    )
    .filter(Boolean);
  return segments.length ? segments.join("/") : "products";
}

function makeKey({ buffer, mime, originalName, folder }) {
  const sha = crypto
    .createHash("sha256")
    .update(buffer)
    .digest("hex")
    .slice(0, 8);
  const base = sanitizeBase(originalName);
  const ext = extFromMime(mime);
  const safeFolder = sanitizeFolder(folder);
  return `${safeFolder}/${base}-${sha}${ext}`;
}

// ─────────────────────────────────────────────────────────────
// R2 backend
// ─────────────────────────────────────────────────────────────

async function saveToR2({ buffer, mime, key }) {
  const { PutObjectCommand, HeadObjectCommand } = await import(
    "@aws-sdk/client-s3"
  );
  const s3 = await getS3Client();
  const Bucket = process.env.R2_BUCKET;

  let exists = false;
  try {
    await s3.send(new HeadObjectCommand({ Bucket, Key: key }));
    exists = true;
  } catch (err) {
    if (err.$metadata?.httpStatusCode !== 404 && err.name !== "NotFound") {
      throw err;
    }
  }

  if (!exists) {
    await s3.send(
      new PutObjectCommand({
        Bucket,
        Key: key,
        Body: buffer,
        ContentType: mime,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
  }

  return {
    key,
    url: publicUrlForKey(key),
    bytes: buffer.length,
    mime,
    backend: "r2",
    deduped: exists,
  };
}

// ─────────────────────────────────────────────────────────────
// Local backend
// ─────────────────────────────────────────────────────────────

async function saveToLocal({ buffer, mime, key }) {
  const fullPath = path.join(PUBLIC_UPLOADS, key);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
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
    backend: "local",
  };
}

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

/**
 * Save one file. `folder` is the bucket-relative folder path, e.g.
 * `"products/cute-dino-art-bag"`. Defaults to `"products"` if omitted.
 */
export async function saveUpload({
  buffer,
  mime,
  originalName,
  folder = "products",
}) {
  if (!buffer || !mime) throw new Error("Missing file payload");
  if (!ALLOWED_MIME.has(mime)) throw new Error(`Unsupported file type: ${mime}`);
  if (buffer.length > MAX_BYTES) throw new Error("File exceeds the 25 MB limit");

  const key = makeKey({ buffer, mime, originalName, folder });

  if (r2EnvIsConfigured()) {
    return saveToR2({ buffer, mime, key });
  }
  return saveToLocal({ buffer, mime, key });
}

/**
 * Convenience: pull every file off a FormData field and store each one
 * under the same product folder.
 */
export async function saveFormDataImages(
  formData,
  fieldName = "images",
  options = {}
) {
  const { folder = "products" } = options;
  const items = formData
    .getAll(fieldName)
    .filter((v) => v && typeof v !== "string");
  const results = [];
  for (const file of items) {
    const buf = Buffer.from(await file.arrayBuffer());
    const saved = await saveUpload({
      buffer: buf,
      mime: file.type,
      originalName: file.name,
      folder,
    });
    results.push(saved);
  }
  return results;
}

export function storageBackend() {
  return r2EnvIsConfigured() ? "r2" : "local";
}

export const STORAGE_LIMITS = {
  maxBytes: MAX_BYTES,
  allowedMime: Array.from(ALLOWED_MIME),
};


/**
 * Turn a free-text product title into a single-segment folder name that's
 * safe to use as an R2 / S3 key prefix while still being human-readable in
 * the bucket UI.
 *
 *   "Box Backpack - Hot Air Balloon"   → "Box Backpack - Hot Air Balloon"
 *   "Towels & Wraps / Adults"          → "Towels & Wraps - Adults"
 *   "  multiple   spaces  "            → "multiple spaces"
 *   ""                                 → "untitled-product"
 *
 * Spaces and capital letters are preserved (they're rendered as %20 in
 * URLs but show as-is in the Cloudflare bucket explorer, which is what the
 * admin sees). Path separators and control characters are stripped so a
 * malicious or weird title can't escape the products/ prefix.
 */
export function folderFromTitle(title) {
  const cleaned = String(title || "")
    .normalize("NFKC")
    // Replace slashes/backslashes with " - " so they don't create sub-folders
    .replace(/[\/\\]+/g, " - ")
    // Strip control characters and the few S3-unfriendly punctuation marks
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1F\x7F"`<>|*?]+/g, "")
    // Collapse whitespace runs
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
  return cleaned || "untitled-product";
}

/**
 * Look at an existing product's images and try to extract the folder
 * portion they share so a future upload can land alongside them.
 * Returns null when the array is empty or the URLs are inconsistent.
 *
 *   "https://cdn.example/products/Cute Dino Art Bag/front-abc.png"
 *   → "products/Cute Dino Art Bag"
 */
export function inferFolderFromImageUrls(urls) {
  if (!Array.isArray(urls) || urls.length === 0) return null;
  const folders = new Set();
  for (const u of urls) {
    if (typeof u !== "string") continue;
    let pathname;
    try {
      pathname = u.startsWith("http") ? new URL(u).pathname : u;
    } catch {
      continue;
    }
    // Drop a leading bucket name when the URL goes through the S3
    // endpoint instead of the custom CDN domain.
    let parts = pathname.split("/").filter(Boolean);
    if (parts[0] === process.env.R2_BUCKET) parts = parts.slice(1);
    // Local fallback paths look like /uploads/<folder...>/<file>
    if (parts[0] === "uploads") parts = parts.slice(1);
    if (parts.length < 2) continue;
    // Drop the filename — keep everything before it as the folder
    folders.add(parts.slice(0, -1).join("/"));
  }
  if (folders.size !== 1) return null;
  return [...folders][0];
}
