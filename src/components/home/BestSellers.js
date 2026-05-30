import { getProductsBySlugs } from "@/lib/services/storefront-products";
import BestSellersClient from "./BestSellersClient";

/**
 * Curated "Season's Picks" carousel for the homepage.
 *
 * Slugs are hand-curated. Looking them up against MongoDB at request
 * time means we automatically pick up image / title / price changes
 * the admin makes — no rebuild needed.
 */
const SEASON_SLUGS = [
  "art-bag-mermaid",
  "art-bag-frozen",
  "jelly-tote-bag-pink",
  "swim-bag-with-pouch-frozen",
  "art-bag-dinosaur",
  "duffle-bag-with-toy-keychain-frozen",
];

const BADGES = {
  "art-bag-mermaid": { badge: "Top Seller" },
  "jelly-tote-bag-pink": { badge: "New", badgeStyle: "peach" },
  "art-bag-dinosaur": { badge: "Must Have", badgeStyle: "peach" },
  "duffle-bag-with-toy-keychain-frozen": {
    badge: "Trending",
    badgeStyle: "blue",
  },
};

export default async function BestSellers() {
  const products = await getProductsBySlugs(SEASON_SLUGS);
  const featured = products.map((p) => ({
    ...p,
    discount: p.originalPrice
      ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
      : 0,
    ...(BADGES[p.slug] || {}),
  }));

  return <BestSellersClient products={featured} />;
}
