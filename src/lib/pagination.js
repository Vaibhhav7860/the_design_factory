/**
 * URL-driven pagination helpers shared by every admin list page.
 *
 * URL contract:
 *   ?q=<search>           — filter (page resets to 1 when present)
 *   ?page=<n>             — 1-based page number
 *   ?perPage=20|50|100    — items per page
 */

export const PER_PAGE_OPTIONS = [20, 50, 100];
export const DEFAULT_PER_PAGE = 20;

export function parsePerPage(value) {
  const n = parseInt(value, 10);
  return PER_PAGE_OPTIONS.includes(n) ? n : DEFAULT_PER_PAGE;
}

export function parsePage(value) {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

/**
 * Turn the URL into a sanitised pagination state. Accepts an already-resolved
 * searchParams object (after `await searchParams` in Next 16).
 */
export function parsePagination(searchParams = {}) {
  const q = String(searchParams.q || "").trim().slice(0, 200);
  const perPage = parsePerPage(searchParams.perPage);
  const page = parsePage(searchParams.page);
  return { q, page, perPage, skip: (page - 1) * perPage, limit: perPage };
}

/**
 * Build a Mongo `$or` regex filter from a search query, escaping special chars.
 * Returns `null` when the query is empty so callers can pass it directly:
 *
 *   const filter = textFilter(q, ["title", "slug"]) ?? {};
 */
export function textFilter(query, fields) {
  if (!query) return null;
  const safe = String(query).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rx = new RegExp(safe, "i");
  return { $or: fields.map((f) => ({ [f]: rx })) };
}
