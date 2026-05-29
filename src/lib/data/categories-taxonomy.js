/**
 * Canonical category + subcategory taxonomy used by the admin product editor
 * and the storefront's mega-menu.
 *
 * Slugs match the storefront URLs, e.g. /category/labels?subcategory=round-labels.
 */
export const CATEGORIES = [
  {
    slug: "labels",
    label: "Labels",
    subcategories: [
      { slug: "rectangular-labels", label: "Rectangular Labels" },
      { slug: "round-labels", label: "Round Labels" },
      { slug: "mixed-shape-labels", label: "Mixed Shape Labels" },
      { slug: "transparent-labels", label: "Transparent Labels" },
      { slug: "3d-embossed-stickers", label: "3D Embossed Stickers" },
      { slug: "school-book-labels", label: "School Book Labels" },
      { slug: "iron-on-labels", label: "Iron On Labels For Clothes" },
    ],
  },
  {
    slug: "school-essentials",
    label: "School Essentials",
    subcategories: [
      { slug: "name-labels", label: "Name Labels" },
      { slug: "iron-on-labels-clothes", label: "Iron On Labels For Clothes" },
      { slug: "permanent-waterproof-stickers", label: "Permanent Waterproof Stickers" },
      { slug: "school-book-labels", label: "School Book Labels" },
      { slug: "bag-tags", label: "Bag Tags" },
      { slug: "back-to-school-label-set", label: "Back to School Label Set" },
      { slug: "sipper-bottle", label: "Sipper Bottle" },
      { slug: "lunch-box", label: "Lunch Box" },
      { slug: "sketch-book", label: "Sketch Book" },
      { slug: "rewritable-planners", label: "Rewritable Planners" },
      { slug: "pencil-case", label: "Pencil Case" },
      { slug: "school-bag-combos", label: "School Bag & Combos" },
    ],
  },
  {
    slug: "gift-stationery",
    label: "Gift Stationery",
    subcategories: [
      { slug: "3d-gift-tags", label: "3D Gift Tags" },
      { slug: "flat-gift-tags", label: "Flat Gift Tags" },
      { slug: "hanging-gift-tags", label: "Hanging Gift Tags" },
      { slug: "gift-stickers", label: "Gift Stickers" },
      { slug: "money-envelopes", label: "Money Envelopes" },
      { slug: "gift-stationery-sets", label: "Gift Stationery Combo" },
    ],
  },
  {
    slug: "adults-corner",
    label: "Adults Corner",
    subcategories: [
      { slug: "flat-gift-tags-adults", label: "Flat Gift Tags" },
      { slug: "3d-gift-tags-adults", label: "3D Gift Tags" },
      { slug: "money-envelopes-adults", label: "Money Envelopes" },
      { slug: "bag-tags-adults", label: "Bag Tags" },
      { slug: "towels-adults", label: "Towels" },
      { slug: "gift-stationery-combo-adults", label: "Gift Stationery Combo" },
    ],
  },
  {
    slug: "bags",
    label: "Bags",
    subcategories: [
      { slug: "duffle-bags", label: "Duffle Bags" },
      { slug: "jelly-bags", label: "Jelly Bags" },
      { slug: "art-bags", label: "Art Bags" },
      { slug: "backpacks", label: "Backpacks" },
      { slug: "tote-bags", label: "Tote Bags" },
      { slug: "swimming-bags", label: "Swimming Bags" },
      { slug: "school-bags", label: "School Bags" },
      { slug: "denim-bags", label: "Denim Bags" },
      { slug: "baby-diaper-bag", label: "Baby Diaper Bag" },
    ],
  },
  {
    slug: "organisers",
    label: "Organisers",
    subcategories: [
      { slug: "utility-pouches", label: "Utility Pouches" },
      { slug: "storage-basket", label: "Storage Basket" },
      { slug: "vanity", label: "Vanity" },
      { slug: "organiser-sets", label: "Organiser Sets" },
    ],
  },
  {
    slug: "kids-accessories",
    label: "Kids Accessories",
    subcategories: [
      { slug: "wall-clock", label: "Wall Clock" },
      { slug: "table-mat", label: "Table Mat" },
      { slug: "towel", label: "Towel" },
      { slug: "table-organiser", label: "Table Organiser" },
      { slug: "cap", label: "Cap" },
      { slug: "apron-set", label: "Apron Set" },
      { slug: "neck-pillow-combo", label: "Neck Pillow Combo" },
    ],
  },
  {
    slug: "combos",
    label: "Combos",
    subcategories: [
      { slug: "back-to-school-label-set", label: "Back To School Label Set" },
      { slug: "gift-stationery-combo-kids", label: "Gift Stationery Combo - Kids" },
      { slug: "gift-stationery-combo-adults", label: "Gift Stationery Combo - Adults" },
      { slug: "bag-combo-set", label: "Bag Combo Set" },
      { slug: "school-bag-combo", label: "School Bag Combo" },
      { slug: "organiser-sets", label: "Organiser Sets" },
    ],
  },
  {
    slug: "themes",
    label: "Shop By Theme",
    subcategories: [
      { slug: "animals", label: "Animals" },
      { slug: "cute-lil-boy", label: "Cute Lil Boy" },
      { slug: "cute-lil-girl", label: "Cute Lil Girl" },
      { slug: "dino", label: "Dino" },
      { slug: "favourite-characters", label: "Favourite Characters" },
      { slug: "princess", label: "Princess" },
      { slug: "space", label: "Space" },
      { slug: "superheroes", label: "Superheroes" },
      { slug: "transport", label: "Transport" },
      { slug: "unicorn", label: "Unicorn" },
      { slug: "underwater", label: "Underwater" },
    ],
  },
];

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);

export function getCategoryBySlug(slug) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryLabel(slug) {
  return getCategoryBySlug(slug)?.label || slug;
}

/**
 * Returns subcategories belonging to any of the given category slugs,
 * deduplicated by their own slug (since some subcategories appear under
 * more than one parent — e.g. "school-book-labels").
 */
export function subcategoriesForCategories(categorySlugs = []) {
  const seen = new Map();
  for (const cs of categorySlugs) {
    const cat = getCategoryBySlug(cs);
    if (!cat) continue;
    for (const sc of cat.subcategories) {
      if (!seen.has(sc.slug)) {
        seen.set(sc.slug, { ...sc, parentCategory: cs });
      }
    }
  }
  return Array.from(seen.values());
}

export const TAG_COLORS = [
  { value: "#FCD589", label: "Gold" },
  { value: "#FBC9BC", label: "Peach" },
  { value: "#d7e4e4", label: "Mint" },
];
