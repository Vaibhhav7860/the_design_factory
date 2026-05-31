/**
 * Storefront search service.
 *
 * "Semantic-feeling" hybrid search without dragging in vector embeddings:
 *
 *   1. Tokenise + normalise the query (lowercase, strip punctuation,
 *      drop stop-words, fold simple plurals).
 *   2. Expand each token with a synonym map so "frozen" → ["frozen",
 *      "elsa", "anna"], "dino" → ["dino", "dinosaur"], "school" →
 *      ["school", "labels", "stationery"], etc.
 *   3. Pull a candidate set with a single MongoDB regex query that
 *      matches any expanded token across title, slug, categories,
 *      subcategories, and tag labels.
 *   4. Rank candidates in JS with a weighted scorer:
 *        title exact > title starts > title contains > slug > category
 *        > subcategory > tag > description.
 *      Bonus points for matching multiple tokens, exact-title hits,
 *      and tag/category mentions (because those are curated signals).
 *   5. Return the top N, deduped by slug.
 *
 * The result feels like fuzzy/intent-aware search to the customer:
 *   "frozen bag"      → swim-bag-frozen, art-bag-frozen, jelly-bag-frozen
 *   "school labels"   → school book labels, name labels, iron-on labels
 *   "for boys"        → cute lil boy theme, superheroes, dino, transport
 *   "valentines gift" → adults-corner gift items, hearts theme
 *
 * This module is server-only.
 */

import { connectToDatabase } from "../db/mongoose.js";
import { Product } from "../db/models/Product.js";
import { categories } from "../../data/categories.js";

const ACTIVE_FILTER = { status: "active" };
const MAX_CANDIDATES = 200;
const DEFAULT_LIMIT = 24;
const SUGGESTION_LIMIT = 6;

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "for", "to", "with", "in", "on",
  "at", "by", "is", "are", "from", "any", "some", "this", "that", "i",
  "we", "my", "our", "your", "you", "me", "us",
]);

/**
 * Curated synonym + intent map. Keys and values are all lowercase.
 * Each key maps to additional tokens we should also search for.
 *
 * Editing rule of thumb: only add entries here when a customer-typed
 * word does NOT appear verbatim on a relevant product. Don't list
 * "label" → "labels" — the singular/plural folder handles that.
 */
const SYNONYMS = {
  // Intent / age / occasion
  "kid": ["kids", "child", "children", "baby"],
  "kids": ["kid", "child", "children"],
  "boy": ["boys", "kids"],
  "boys": ["boy", "kids"],
  "girl": ["girls", "kids"],
  "girls": ["girl", "kids"],
  "adult": ["adults"],
  "adults": ["adults-corner", "adult"],
  "school": ["school-essentials", "school-book-labels", "school-bag-combos"],
  "office": ["adults-corner", "stationery"],
  "gift": ["gift-stationery", "gift-tags", "money-envelopes"],
  "gifting": ["gift", "gift-stationery"],
  "rakhi": ["rakhi", "accessories-gifts"],
  "newborn": ["baby", "kids"],
  "newyear": ["new", "gift"],
  "valentine": ["adults-corner", "hearts", "love"],
  "valentines": ["valentine"],

  // Themes & characters
  "cartoon": ["favourite-characters", "themes"],
  "cartoons": ["cartoon"],
  "frozen": ["frozen", "elsa", "anna", "favourite-characters"],
  "elsa": ["frozen", "favourite-characters"],
  "anna": ["frozen", "favourite-characters"],
  "princess": ["princess", "themes", "elsa", "ariel", "moana"],
  "ariel": ["princess", "favourite-characters"],
  "moana": ["princess", "favourite-characters"],
  "spiderman": ["superheroes", "favourite-characters"],
  "spider": ["spiderman", "superheroes"],
  "superhero": ["superheroes"],
  "superheroes": ["superheroes", "favourite-characters"],
  "marvel": ["superheroes"],
  "dc": ["superheroes"],
  "dino": ["dino", "dinosaur", "dinos"],
  "dinosaur": ["dino", "dinos"],
  "dinos": ["dino", "dinosaur"],
  "animal": ["animals", "themes"],
  "unicorn": ["unicorn", "themes"],
  "space": ["space", "rocket", "themes"],
  "rocket": ["space"],
  "underwater": ["underwater", "mermaid", "themes"],
  "mermaid": ["mermaid", "underwater", "princess"],
  "transport": ["transport", "themes", "vehicles"],
  "vehicle": ["transport"],
  "vehicles": ["transport"],
  "car": ["transport"],
  "truck": ["transport"],
  "peppa": ["peppa", "favourite-characters"],
  "harry": ["harry", "potter", "favourite-characters"],
  "potter": ["harry", "potter"],
  "minion": ["minions", "favourite-characters"],
  "minions": ["minion", "favourite-characters"],
  "lego": ["lego", "favourite-characters"],

  // Categories (synonym → catalog slug)
  "bag": ["bags"],
  "bags": ["bags", "duffle-bags", "tote-bags", "art-bags", "swimming-bags"],
  "tote": ["tote-bags", "bags"],
  "duffle": ["duffle-bags", "bags"],
  "swim": ["swimming-bags", "swim-bag"],
  "swimming": ["swimming-bags"],
  "backpack": ["backpacks", "school-bags"],
  "label": ["labels", "name-labels", "school-book-labels"],
  "labels": ["labels", "name-labels"],
  "sticker": ["3d-embossed-stickers", "permanent-waterproof-stickers", "gift-stickers"],
  "stickers": ["sticker"],
  "envelope": ["money-envelopes"],
  "envelopes": ["money-envelopes"],
  "money": ["money-envelopes"],
  "tag": ["bag-tags", "gift-tags", "3d-gift-tags"],
  "tags": ["tag"],
  "bottle": ["sipper-bottle"],
  "bottles": ["sipper-bottle"],
  "lunch": ["lunch-box", "tiffin"],
  "lunchbox": ["lunch-box"],
  "tiffin": ["lunch-box"],
  "tiffins": ["lunch-box"],
  "pencil": ["pencil-case"],
  "stationery": ["gift-stationery", "stationery"],
  "stationary": ["stationery"], // common typo
  "planner": ["rewritable-planners"],
  "planners": ["rewritable-planners"],
  "folder": ["ring-folders", "expandable-folders"],
  "folders": ["folder"],
  "towel": ["towels"],
  "wallclock": ["wall-clock"],
  "tablemat": ["table-mat"],
  "apron": ["apron-set"],
  "pillow": ["neck-pillow-combo", "neck-pillow-set"],
  "neck": ["neck-pillow-combo"],
  "diaper": ["baby-diaper-bag"],
  "combo": ["combos", "school-bag-combo", "back-to-school-label-set"],
  "combos": ["combo"],
  "set": ["organiser-sets", "back-to-school-label-set", "apron-set"],
  "organiser": ["organisers", "utility-pouches"],
  "organizer": ["organiser"], // US spelling
  "organisers": ["organisers"],
  "pouch": ["utility-pouches", "multipurpose-pouches"],
  "pouches": ["pouch"],
  "vanity": ["vanity"],
  "basket": ["storage-basket"],
};

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function escapeForRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tokenise(query) {
  return String(query || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\p{Diacritic}]/gu, "")
    .replace(/[^a-z0-9\s-]+/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => !STOPWORDS.has(t));
}

/**
 * Expand a single token with its synonym set + a basic plural / singular
 * fold. Returns a deduped array of strings.
 */
function expandToken(token) {
  const out = new Set([token]);

  // Plural / singular fold (cheap heuristic)
  if (token.length > 3 && token.endsWith("s")) out.add(token.slice(0, -1));
  if (token.length > 2 && !token.endsWith("s")) out.add(token + "s");

  // Synonym map
  const bucket = SYNONYMS[token];
  if (bucket) bucket.forEach((s) => out.add(s));

  return [...out];
}

function expandTokens(tokens) {
  const seen = new Set();
  const groups = []; // each group: [variants...] for one input token
  for (const t of tokens) {
    const variants = expandToken(t);
    const fresh = variants.filter((v) => !seen.has(v));
    fresh.forEach((v) => seen.add(v));
    if (fresh.length) groups.push(fresh);
  }
  return groups;
}

/**
 * Build the Mongo `$or` filter that fetches candidates. For each
 * expanded token, we accept a hit on any of: title, slug, categories,
 * subcategories, tags.label.
 */
function buildCandidateFilter(allVariants) {
  if (allVariants.length === 0) return null;
  const orClauses = [];
  for (const v of allVariants) {
    const escaped = escapeForRegex(v);
    const rx = new RegExp(escaped, "i");
    orClauses.push(
      { title: rx },
      { slug: rx },
      { description: rx },
      { categories: rx },
      { subcategories: rx },
      { "tags.label": rx }
    );
  }
  return { ...ACTIVE_FILTER, $or: orClauses };
}

/**
 * Score a candidate against the original token groups. Higher is better.
 *
 * Weights (curated, tweak freely):
 *   exact title match (whole query)        : 200
 *   title starts with query                 : 120
 *   title contains the full query           : 80
 *   title contains a token                  : 30
 *   slug contains a token                   : 22
 *   category contains a token               : 18
 *   subcategory contains a token            : 16
 *   tag label contains a token              : 14
 *   description contains a token            : 6
 *
 * Plus a multi-token bonus: products that match ALL token groups get
 * +25. Products with personalisation enabled and a personalisation-y
 * query get +5 (small nudge).
 */
function scoreCandidate(product, query, tokenGroups) {
  const lowerQuery = query.toLowerCase();
  const title = (product.title || "").toLowerCase();
  const slug = (product.slug || "").toLowerCase();
  const desc = (product.description || "").toLowerCase();
  const cats = (product.categories || []).map((c) => c.toLowerCase());
  const subs = (product.subcategories || []).map((s) => s.toLowerCase());
  const tagLabels = (product.tags || [])
    .map((t) => (t?.label || "").toLowerCase())
    .filter(Boolean);

  let score = 0;
  let groupsMatched = 0;

  if (title === lowerQuery) score += 200;
  else if (title.startsWith(lowerQuery)) score += 120;
  else if (title.includes(lowerQuery)) score += 80;

  for (const group of tokenGroups) {
    let groupHit = false;
    for (const variant of group) {
      if (title.includes(variant)) {
        score += 30;
        groupHit = true;
      }
      if (slug.includes(variant)) {
        score += 22;
        groupHit = true;
      }
      if (cats.some((c) => c.includes(variant))) {
        score += 18;
        groupHit = true;
      }
      if (subs.some((s) => s.includes(variant))) {
        score += 16;
        groupHit = true;
      }
      if (tagLabels.some((t) => t.includes(variant))) {
        score += 14;
        groupHit = true;
      }
      if (desc.includes(variant)) {
        score += 6;
        groupHit = true;
      }
    }
    if (groupHit) groupsMatched++;
  }

  if (groupsMatched === tokenGroups.length && tokenGroups.length > 1) {
    score += 25;
  }

  // Personalisation nudge if the customer is searching for one
  if (
    /\b(name|personalis|personaliz|engrav|custom)/.test(lowerQuery) &&
    product.personalisation?.name === "required"
  ) {
    score += 5;
  }

  return { score, groupsMatched };
}

function serialiseProductForSearch(p, score) {
  return {
    id: String(p._id),
    slug: p.slug,
    title: p.title || "",
    image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null,
    price: Math.round(p.price ?? 0) / 100,
    originalPrice:
      p.originalPrice != null ? Math.round(p.originalPrice) / 100 : null,
    discountPercent: p.discountPercent ?? 0,
    categories: Array.isArray(p.categories) ? p.categories : [],
    subcategories: Array.isArray(p.subcategories) ? p.subcategories : [],
    score,
  };
}

/**
 * Match the query against the static category taxonomy so we can
 * surface category & subcategory shortcuts in the dropdown.
 */
function matchCategories(query, tokenGroups) {
  const lowerQuery = query.toLowerCase();
  const allTokens = tokenGroups.flat();
  const out = [];

  for (const cat of categories) {
    const catTitle = (cat.title || "").toLowerCase();
    const catSlug = (cat.slug || "").toLowerCase();

    let catMatch = false;
    if (catTitle.includes(lowerQuery) || catSlug.includes(lowerQuery)) {
      catMatch = true;
    } else if (allTokens.some((t) => catTitle.includes(t) || catSlug.includes(t))) {
      catMatch = true;
    }

    if (catMatch) {
      out.push({
        type: "category",
        title: cat.title,
        slug: cat.slug,
        href: `/category/${cat.slug}`,
      });
    }

    for (const sub of cat.subcategories || []) {
      const subTitle = (sub.title || "").toLowerCase();
      const subSlug = (sub.slug || "").toLowerCase();
      let subMatch = false;
      if (subTitle.includes(lowerQuery) || subSlug.includes(lowerQuery)) {
        subMatch = true;
      } else if (
        allTokens.some((t) => subTitle.includes(t) || subSlug.includes(t))
      ) {
        subMatch = true;
      }
      if (subMatch) {
        out.push({
          type: "subcategory",
          title: `${sub.title} · ${cat.title}`,
          slug: `${cat.slug}/${sub.slug}`,
          href: `/category/${cat.slug}?subcategory=${sub.slug}`,
        });
      }
    }
  }

  // Cap; favour exact-title matches first
  return out
    .sort((a, b) => {
      const ax = a.title.toLowerCase().includes(lowerQuery) ? 1 : 0;
      const bx = b.title.toLowerCase().includes(lowerQuery) ? 1 : 0;
      return bx - ax;
    })
    .slice(0, 6);
}

// ─────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────

/**
 * Quick suggestions for the navbar dropdown. Returns a small set of
 * top products + matching categories.
 *
 *   { query, tookMs, productResults: [...top 6], categoryResults: [...] }
 */
export async function suggestStorefront(query) {
  const trimmed = String(query || "").trim();
  if (trimmed.length < 2) {
    return {
      query: trimmed,
      productResults: [],
      categoryResults: [],
      total: 0,
    };
  }
  const t0 = Date.now();

  const tokens = tokenise(trimmed);
  const tokenGroups = expandTokens(tokens);
  const allVariants = tokenGroups.flat();
  const filter = buildCandidateFilter(
    allVariants.length ? allVariants : [trimmed]
  );

  await connectToDatabase();

  const candidates = await Product.find(filter)
    .limit(MAX_CANDIDATES)
    .lean();

  const ranked = candidates
    .map((p) => {
      const { score } = scoreCandidate(p, trimmed, tokenGroups);
      return { product: p, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, SUGGESTION_LIMIT);

  return {
    query: trimmed,
    tookMs: Date.now() - t0,
    productResults: ranked.map((r) =>
      serialiseProductForSearch(r.product, r.score)
    ),
    categoryResults: matchCategories(trimmed, tokenGroups),
    total: candidates.length,
  };
}

/**
 * Full results page query. Same scoring as the dropdown but returns
 * the top `limit` (default 24).
 */
export async function searchStorefront(query, { limit = DEFAULT_LIMIT } = {}) {
  const trimmed = String(query || "").trim();
  if (trimmed.length < 2) {
    return { query: trimmed, results: [], categoryResults: [], total: 0 };
  }
  const t0 = Date.now();

  const tokens = tokenise(trimmed);
  const tokenGroups = expandTokens(tokens);
  const allVariants = tokenGroups.flat();
  const filter = buildCandidateFilter(
    allVariants.length ? allVariants : [trimmed]
  );

  await connectToDatabase();
  const candidates = await Product.find(filter)
    .limit(MAX_CANDIDATES)
    .lean();

  const ranked = candidates
    .map((p) => {
      const { score } = scoreCandidate(p, trimmed, tokenGroups);
      return { product: p, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return {
    query: trimmed,
    tookMs: Date.now() - t0,
    results: ranked.map((r) =>
      serialiseProductForSearch(r.product, r.score)
    ),
    categoryResults: matchCategories(trimmed, tokenGroups),
    total: ranked.length,
    candidateCount: candidates.length,
  };
}
