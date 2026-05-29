/**
 * Shared parser for the export-range URL params used by every export endpoint.
 *
 *   ?scope=all                — every record (capped to MAX_EXPORT)
 *   ?scope=current            — the page the user is currently looking at
 *   ?scope=range&from=4&to=8  — pages 4 through 8 (1-based, inclusive)
 *
 *   ?perPage=20|50|100|...    — records per "page" (also acts as the page
 *                               size for slicing the range)
 *
 *   The same `q` and any page-specific filter (e.g. `status` for orders)
 *   are honoured so that the export reflects what the admin actually sees.
 */

const HARD_CAP = 50000; // safety net so a runaway export can't OOM the server
const MIN_PER_PAGE = 1;
const MAX_PER_PAGE = 500;

function clampInt(value, fallback, { min, max }) {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

export function parseExportRange(searchParams = {}) {
  const scope = ["all", "current", "range"].includes(searchParams.scope)
    ? searchParams.scope
    : "all";

  const perPage = clampInt(searchParams.perPage, 50, {
    min: MIN_PER_PAGE,
    max: MAX_PER_PAGE,
  });

  const currentPage = clampInt(searchParams.page, 1, { min: 1, max: 100000 });

  let skip = 0;
  let limit = HARD_CAP;

  if (scope === "current") {
    skip = (currentPage - 1) * perPage;
    limit = perPage;
  } else if (scope === "range") {
    const from = clampInt(searchParams.from, 1, { min: 1, max: 100000 });
    const to = clampInt(searchParams.to, from, { min: 1, max: 100000 });
    const lo = Math.min(from, to);
    const hi = Math.max(from, to);
    skip = (lo - 1) * perPage;
    limit = (hi - lo + 1) * perPage;
  }

  // Always cap to HARD_CAP so a malicious or accidental scope=all on a huge
  // collection can't blow up the response.
  limit = Math.min(limit, HARD_CAP);

  const q = String(searchParams.q || "").trim().slice(0, 200);

  return { scope, perPage, page: currentPage, skip, limit, q, hardCap: HARD_CAP };
}
