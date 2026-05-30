import {
  getProductsByCategory,
  getProductsBySubcategory,
} from "@/lib/services/storefront-products";
import MakeComboClient from "./MakeComboClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Make a Combo | The Design Factory",
  description:
    "Build your own combo from our personalised gifts and stationery — pick 3 for 10% off or 5+ for 20% off.",
};

/**
 * Combo categories. Each entry tells the server which slice of the
 * catalog to fetch. Subcategories are OR-ed (a product matching any
 * one is included). The fetched list is capped client-side to 30.
 */
const COMBO_CATEGORIES = [
  {
    id: "bags",
    label: "Bags",
    image: "/images/categories/bags.png",
    category: "bags",
    subcategories: ["art-bags", "tote-bags", "swimming-bags", "duffle-bags"],
    excludeCategories: ["combos"],
  },
  {
    id: "bottles",
    label: "Bottles",
    image: "/images/categories/organisers.png",
    subcategories: ["sipper-bottle"],
  },
  {
    id: "gift-tags",
    label: "Gift Tags",
    image: "/images/categories/gift_stationery.png",
    subcategories: ["3d-gift-tags", "3d-gift-tags-adults"],
  },
  {
    id: "tiffins",
    label: "Tiffins",
    image: "/images/categories/school.png",
    subcategories: ["lunch-box"],
  },
  {
    id: "money-envelopes",
    label: "Money Envelopes",
    image: "/images/categories/stationery.png",
    subcategories: ["money-envelopes"],
  },
  {
    id: "labels",
    label: "Labels",
    image: "/images/categories/labels.png",
    category: "labels",
    subcategories: [
      "rectangular-labels",
      "round-labels",
      "mixed-shape-labels",
      "transparent-labels",
    ],
  },
  {
    id: "bag-tags",
    label: "Bag Tags",
    image: "/images/categories/kids_accessories.png",
    subcategories: ["bag-tags"],
  },
];

const PRODUCTS_PER_BUCKET = 30;

/**
 * Build the product list for one combo category. We resolve OR-of-subs
 * by pulling each subcategory in parallel, then deduping by slug.
 */
async function fetchBucket(bucket) {
  if (bucket.category && bucket.subcategories?.length) {
    // category + sub list (the original "must match category and any sub")
    const lists = await Promise.all(
      bucket.subcategories.map((sc) =>
        getProductsBySubcategory(bucket.category, sc)
      )
    );
    const merged = mergeUnique(lists);
    if (bucket.excludeCategories?.length) {
      return merged.filter(
        (p) =>
          !p.categories.some((c) => bucket.excludeCategories.includes(c))
      );
    }
    return merged;
  }

  if (bucket.subcategories?.length) {
    // just OR of subcategories across the whole catalog. We use the
    // category-less subcategory match by walking the whole catalog
    // and filtering — simpler than building a multi-category $in.
    const all = await getProductsByCategory(bucket.category || null);
    if (all.length === 0) {
      // No category specified — fall back to the union approach by
      // querying each subcategory under any category that has it.
      const lists = await Promise.all(
        bucket.subcategories.map((sc) =>
          // We don't know the category here, so probe the most
          // common ones. For our 13 categories this is fine.
          fetchSubcategoryAnyCategory(sc)
        )
      );
      return mergeUnique(lists);
    }
    return all.filter((p) =>
      p.subcategories.some((s) => bucket.subcategories.includes(s))
    );
  }

  return [];
}

// Probe every category for a given subcategory slug.
const ALL_CATEGORY_SLUGS = [
  "labels",
  "school-essentials",
  "gift-stationery",
  "adults-corner",
  "decor-dining",
  "travel-essentials",
  "organisers",
  "bags",
  "kids-accessories",
  "accessories-gifts",
  "combos",
  "play-learn",
  "themes",
];
async function fetchSubcategoryAnyCategory(subSlug) {
  const lists = await Promise.all(
    ALL_CATEGORY_SLUGS.map((cat) => getProductsBySubcategory(cat, subSlug))
  );
  return mergeUnique(lists);
}

function mergeUnique(lists) {
  const seen = new Map();
  for (const l of lists) {
    for (const p of l) {
      if (!seen.has(p.slug)) seen.set(p.slug, p);
    }
  }
  return [...seen.values()];
}

export default async function MakeComboPage() {
  // Fetch every bucket in parallel
  const buckets = await Promise.all(
    COMBO_CATEGORIES.map(async (bucket) => {
      const items = await fetchBucket(bucket);
      return {
        id: bucket.id,
        label: bucket.label,
        image: bucket.image,
        products: items.slice(0, PRODUCTS_PER_BUCKET),
      };
    })
  );

  return <MakeComboClient buckets={buckets} />;
}
