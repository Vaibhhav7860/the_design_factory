/**
 * Quick R2 smoke test. Uploads a tiny PNG via the storage abstraction and
 * prints the resulting public URL. Run with:
 *
 *   npm run smoke:r2
 *
 * If MEDIA_CDN_URL is set, fetches the URL afterwards to confirm the
 * Cloudflare custom domain is actually serving the object.
 */
import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

for (const file of [".env.local", ".env.development", ".env"]) {
  const full = path.join(projectRoot, file);
  if (fs.existsSync(full)) dotenv.config({ path: full, override: false });
}

const { saveUpload, storageBackend } = await import(
  "../src/lib/storage/index.js"
);

console.log(`Active storage backend: ${storageBackend()}`);
if (storageBackend() === "local") {
  console.log("  (R2 env vars not detected — falling back to /public/uploads)");
}

// 1×1 transparent PNG, base64
const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgAAIAAAUAAeImBZsAAAAASUVORK5CYII=",
  "base64"
);

console.log("\nUploading 1×1 PNG…");
const saved = await saveUpload({
  buffer: tinyPng,
  mime: "image/png",
  originalName: "smoke-test.png",
  folder: "smoke",
});
console.log(JSON.stringify(saved, null, 2));

if (saved.url.startsWith("http")) {
  try {
    const res = await fetch(saved.url);
    console.log(
      `\nGET ${saved.url}\n  status: ${res.status}\n  content-type: ${res.headers.get("content-type")}`
    );
    if (res.status !== 200) {
      console.log("  ⚠ The upload succeeded but the public URL is not serving 200.");
      console.log("  Check the bucket's custom domain config in Cloudflare.");
    } else {
      console.log("  ✓ Cloudflare CDN is serving the uploaded object.");
    }
  } catch (err) {
    console.error("\nFetch failed:", err.message);
  }
}

console.log("\nDone.");
