/**
 * Migrate every product image off Shopify's CDN onto our Cloudflare R2
 * bucket. Idempotent and resumable — re-running is safe and only touches
 * URLs that haven't been migrated yet.
 *
 * Usage:
 *   npm run migrate:images                  # all products
 *   npm run migrate:images -- --limit=50    # first 50 products only
 *   npm run migrate:images -- --concurrency=4
 *   npm run migrate:images -- --dry-run     # show what would change, no writes
 *   npm run migrate:images -- --slug=duffle-bag-with-toy-keychain-frozen
 *
 * For each product:
 *   1. Walk the `images` array in order.
 *   2. URLs already on MEDIA_CDN_URL or starting with /uploads/ are kept.
 *   3. URLs on http(s) elsewhere (Shopify, etc.) are downloaded as a Buffer
 *      and pushed through saveUpload(), which deduplicates by content
 *      hash and lands them in `products/<Product Title>/<file>-<sha8>.<ext>`.
 *   4. The migrated URL replaces the Shopify URL at the same index.
 *   5. If every URL in the final array is on our CDN, `needsAssetMigration`
 *      is flipped to false.
 *   6. The document is updated in MongoDB.
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

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set. Add it to .env.local at the project root.");
  process.exit(1);
}

// ── CLI args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function flag(name, fallback = undefined) {
  const hit = args.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return fallback;
  if (!hit.includes("=")) return true;
  return hit.split("=").slice(1).join("=");
}
const LIMIT = Number(flag("limit", 0)) || 0;
const CONCURRENCY = Math.max(1, Number(flag("concurrency", 4)) || 4);
const DRY_RUN = !!flag("dry-run", false);
const ONLY_SLUG = typeof flag("slug") === "string" ? flag("slug") : null;
const RETRY_ATTEMPTS = 3;
const RETRY_BACKOFF_MS = 800;

console.log(
  `Config:\n  limit=${LIMIT || "all"}  concurrency=${CONCURRENCY}  dryRun=${DRY_RUN}  slug=${ONLY_SLUG || "(any)"}\n`
);

// ── Imports that depend on env being loaded ─────────────────────────────────
const { connectToDatabase, mongoose } = await import("../src/lib/db/mongoose.js");
const { Product } = await import("../src/lib/db/models/Product.js");
const { saveUpload, folderFromTitle, storageBackend } = await import(
  "../src/lib/storage/index.js"
);

if (storageBackend() !== "r2") {
  console.error(
    "Storage backend is not R2 — check that R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, " +
      "R2_SECRET_ACCESS_KEY, R2_BUCKET, and MEDIA_CDN_URL are set in .env.local."
  );
  process.exit(1);
}

const CDN_PREFIX = (process.env.MEDIA_CDN_URL || "").replace(/\/+$/, "");

// ── Helpers ─────────────────────────────────────────────────────────────────

function isAlreadyMigrated(url) {
  if (typeof url !== "string") return false;
  if (url.startsWith("/uploads/")) return true;
  if (CDN_PREFIX && url.startsWith(CDN_PREFIX)) return true;
  return false;
}

function fileNameFromUrl(url) {
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop() || "image";
    // Strip Shopify's "?v=..." cache buster (already gone via URL parsing)
    return decodeURIComponent(last);
  } catch {
    return "image";
  }
}

function extToMime(ext) {
  switch (ext.toLowerCase()) {
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "png":  return "image/png";
    case "webp": return "image/webp";
    case "avif": return "image/avif";
    case "gif":  return "image/gif";
    case "svg":  return "image/svg+xml";
    default:     return null;
  }
}

async function fetchBuffer(url) {
  let lastErr;
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        // Some CDNs block default UA — be polite and identifiable.
        headers: { "user-agent": "TheDesignFactory-Migrator/1.0" },
        redirect: "follow",
      });
      if (!res.ok) {
        const err = new Error(`HTTP ${res.status} ${res.statusText}`);
        err.status = res.status;
        if (res.status >= 400 && res.status < 500 && res.status !== 429) {
          // No point retrying a hard 4xx (404, 410, etc.)
          throw err;
        }
        throw err;
      }
      const arrayBuf = await res.arrayBuffer();
      const mime = res.headers.get("content-type")?.split(";")[0]?.trim();
      return { buffer: Buffer.from(arrayBuf), mime };
    } catch (err) {
      lastErr = err;
      if (err.status && err.status < 500 && err.status !== 429) throw err;
      if (attempt < RETRY_ATTEMPTS) {
        await new Promise((r) =>
          setTimeout(r, RETRY_BACKOFF_MS * Math.pow(2, attempt - 1))
        );
      }
    }
  }
  throw lastErr || new Error("Fetch failed");
}

async function migrateOneUrl({ url, folder }) {
  const { buffer, mime: responseMime } = await fetchBuffer(url);

  // Prefer the response Content-Type (Shopify is reliable about this);
  // fall back to deriving from the URL's extension.
  let mime = responseMime;
  if (!mime || mime === "application/octet-stream") {
    const ext = path.extname(fileNameFromUrl(url)).replace(/^\./, "");
    mime = extToMime(ext);
  }
  if (!mime) {
    throw new Error(`Could not determine MIME type for ${url}`);
  }

  const originalName = fileNameFromUrl(url);
  const saved = await saveUpload({
    buffer,
    mime,
    originalName,
    folder,
  });
  return saved;
}

// ── Concurrency-limited mapper ──────────────────────────────────────────────

async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      try {
        results[i] = { ok: true, value: await fn(items[i], i) };
      } catch (err) {
        results[i] = { ok: false, error: err };
      }
    }
  });
  await Promise.all(workers);
  return results;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("→ Connecting to MongoDB…");
  await connectToDatabase();
  console.log("  ✓ connected\n");

  const filter = ONLY_SLUG
    ? { slug: ONLY_SLUG }
    : {
        // Anything we know hasn't been migrated yet, OR explicitly flagged.
        $or: [
          { needsAssetMigration: true },
          { images: { $regex: "^https?://(?!" + escapeForRegex(CDN_PREFIX) + ")" } },
        ],
      };

  // Use _id-keyed pagination instead of a streaming cursor. Atlas closes
  // idle cursors after ~10 minutes and our per-product work (download +
  // upload) easily exceeds that across hundreds of products. Each page
  // is fetched, fully drained, and the cursor closed inside lean()
  // before we move on, so there's nothing to evict.
  const PAGE_SIZE = 50;
  let lastId = null;
  let processed = 0;
  let imagesMigrated = 0;
  let imagesSkipped = 0;
  let imagesFailed = 0;
  let productsUntouched = 0;
  const failures = [];

  outer: while (true) {
    const pageFilter = lastId
      ? { ...filter, _id: { $gt: lastId } }
      : filter;
    let page;
    let pageAttempts = 0;
    while (true) {
      pageAttempts++;
      try {
        page = await Product.find(pageFilter)
          .sort({ _id: 1 })
          .limit(PAGE_SIZE);
        break;
      } catch (err) {
        if (pageAttempts >= 3) throw err;
        const wait = 1000 * Math.pow(2, pageAttempts - 1);
        console.warn(`  page query failed (${err.code || err.name}); retrying in ${wait}ms…`);
        await new Promise((r) => setTimeout(r, wait));
      }
    }
    if (page.length === 0) break;
    lastId = page[page.length - 1]._id;

    for (const doc of page) {
      if (LIMIT && processed >= LIMIT) break outer;
      processed++;

    const folder = `products/${folderFromTitle(doc.title)}`;
    const before = (doc.images || []).slice();
    const after = before.slice();

    // Identify the indices that still need migrating
    const work = [];
    before.forEach((url, idx) => {
      if (typeof url !== "string" || !url) return;
      if (isAlreadyMigrated(url)) return;
      if (!/^https?:\/\//i.test(url)) return; // unknown shape, leave it
      work.push({ idx, url });
    });

    if (work.length === 0) {
      productsUntouched++;
      // Recompute the flag in case it was stale
      const allOnCdn = before.every(
        (u) => !u || isAlreadyMigrated(u) || !/^https?:\/\//i.test(u)
      );
      if (doc.needsAssetMigration && allOnCdn && !DRY_RUN) {
        doc.needsAssetMigration = false;
        await doc.save();
      }
      continue;
    }

    console.log(
      `[${processed}] ${doc.slug} — ${work.length} image(s) to migrate → "${folder}"`
    );

    if (DRY_RUN) {
      imagesSkipped += work.length;
      work.forEach((w) => console.log(`     - ${w.url}`));
      continue;
    }

    const results = await mapWithConcurrency(work, CONCURRENCY, async (item) => {
      const saved = await migrateOneUrl({ url: item.url, folder });
      return { idx: item.idx, url: saved.url, deduped: saved.deduped };
    });

    let migratedThisDoc = 0;
    let failedThisDoc = 0;
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      const item = work[i];
      if (r.ok) {
        after[item.idx] = r.value.url;
        migratedThisDoc++;
        imagesMigrated++;
        const dedupNote = r.value.deduped ? " (already in bucket — relinked)" : "";
        console.log(`     ✓ ${item.url}\n        → ${r.value.url}${dedupNote}`);
      } else {
        failedThisDoc++;
        imagesFailed++;
        failures.push({ slug: doc.slug, url: item.url, error: r.error.message });
        console.log(`     ✗ ${item.url}\n        ${r.error.message}`);
      }
    }

    // Save the updated images array. We always persist whatever we did
    // migrate, even if some failed — re-running picks up the rest.
    if (migratedThisDoc > 0) {
      doc.images = after;
      const stillExternal = after.some(
        (u) => typeof u === "string" && /^https?:\/\//i.test(u) && !isAlreadyMigrated(u)
      );
      doc.needsAssetMigration = stillExternal;
      await doc.save();
    }

    if (failedThisDoc > 0) {
      console.log(`     (saved ${migratedThisDoc}/${work.length}; ${failedThisDoc} will retry on next run)\n`);
    } else {
      console.log("");
    }
    } // for-each-doc-in-page
    // If this page returned fewer than PAGE_SIZE rows we've reached the end.
    if (page.length < PAGE_SIZE) break;
  } // while pages remain

  console.log("\n─────────────────────────────────");
  console.log("  Summary");
  console.log("─────────────────────────────────");
  console.log(`  Products processed       : ${processed}`);
  console.log(`  Products already migrated: ${productsUntouched}`);
  console.log(`  Images migrated          : ${imagesMigrated}`);
  if (DRY_RUN) console.log(`  Images that WOULD migrate: ${imagesSkipped}`);
  console.log(`  Images failed            : ${imagesFailed}`);
  if (failures.length) {
    console.log("\n  First failures:");
    failures.slice(0, 10).forEach((f) =>
      console.log(`    - ${f.slug}\n        ${f.url}\n        ${f.error}`)
    );
    if (failures.length > 10) {
      console.log(`    …and ${failures.length - 10} more. Re-run to retry.`);
    }
  }
  console.log("");

  await mongoose.disconnect();
}

function escapeForRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

main().catch(async (err) => {
  console.error("Fatal:", err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
