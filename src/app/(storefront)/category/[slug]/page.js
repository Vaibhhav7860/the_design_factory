import { categories, getCategoryBySlug } from "@/data/categories";
import {
  getProductsByCategory,
  getProductsBySubcategory,
} from "@/lib/services/storefront-products";
import Link from "next/link";
import Image from "next/image";
import FilterSlider from "./FilterSlider";
import FilteredProductsWrapper from "./FilteredProductsWrapper";
import ComboBanner from "@/components/ComboBanner";
import styles from "./category.module.css";

// MongoDB-backed; re-fetch every request so admin edits show immediately.
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  return {
    title: cat
      ? `${cat.title} | The Design Factory`
      : "Collection | The Design Factory",
    description:
      cat?.description ||
      "Browse our curated collection of personalized gifts, labels, bags, and stationery.",
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const subcategory = (await searchParams)?.subcategory;
  const category = getCategoryBySlug(slug);

  // Pick subcategory grid view OR product grid view
  const showSubcategories =
    !subcategory && category?.subcategories && category.subcategories.length > 0;

  // ── Mongo-backed product lookup ──
  // A product whose `categories` array contains <slug> is included.
  // If subcategory is also active, it must additionally have it in
  // `subcategories`. So a product belonging to both labels +
  // school-essentials shows up under both /category/labels and
  // /category/school-essentials.
  const displayProducts = subcategory
    ? await getProductsBySubcategory(slug, subcategory)
    : await getProductsByCategory(slug);

  // Calculate min and max prices for the slider
  let minPrice = 0;
  let maxPrice = 100000;
  if (displayProducts.length > 0) {
    const prices = displayProducts.map((p) => p.price).filter(Boolean);
    if (prices.length) maxPrice = Math.max(...prices);
  }

  // Subcategory tile imagery
  const subcategoryImages = {
    "rectangular-labels": "/images/categories/rectangular-labels.png",
    "round-labels": "/images/categories/round-labels.png",
    "mixed-shape-labels": "/images/categories/mixed-shape-labels.png",
    "transparent-labels": "/images/categories/transparent-labels.png",
    "3d-embossed-stickers": "/images/categories/3d-embossed-stickers.png",
    "school-book-labels": "/images/categories/school-book-labels.png",
    "iron-on-labels": "/images/categories/iron-on-labels.png",
  };
  const fallbackImages = [
    "/images/categories/labels.png",
    "/images/categories/school.png",
    "/images/categories/stationery.png",
    "/images/categories/bags.png",
    "/images/categories/organisers.png",
    "/images/categories/kids_accessories.png",
  ];
  const getSubcategoryImage = (sub, index) =>
    subcategoryImages[sub.slug] ||
    fallbackImages[index % fallbackImages.length];

  const currentSubcategory = subcategory
    ? category?.subcategories?.find((sub) => sub.slug === subcategory)
    : null;

  return (
    <section className={styles.page} style={{ marginTop: "var(--nav-height)" }}>
      <div className={styles.headerArea}>
        <div className={styles.sectionHeader}>
          <h2>{currentSubcategory?.title || category?.title || slug}</h2>
        </div>
        {!showSubcategories &&
          category?.subcategories &&
          category.subcategories.length > 0 && (
            <FilterSlider
              subcategories={category.subcategories}
              currentSlug={slug}
              activeSubcategory={subcategory}
            />
          )}
      </div>

      <div className="container">
        {showSubcategories ? (
          <>
            <div className={styles.subcategoryShowcase}>
              {category.subcategories.map((sub, index) => (
                <Link
                  key={sub.slug}
                  href={`/category/${slug}?subcategory=${sub.slug}`}
                  className={styles.showcaseCard}
                >
                  <div className={styles.showcaseImageWrapper}>
                    <Image
                      src={getSubcategoryImage(sub, index)}
                      alt={sub.title}
                      width={600}
                      height={400}
                      className={styles.showcaseImage}
                    />
                    <div className={styles.showcaseOverlay}>
                      <div className={styles.showcaseContent}>
                        <h3 className={styles.showcaseTitle}>
                          {sub.title.toUpperCase()}
                        </h3>
                        <button
                          className={styles.showcaseButton}
                          style={{
                            "--btn-bg": ["#FCD589", "#FBC9BC", "#d7e4e4"][
                              index % 3
                            ],
                          }}
                        >
                          SHOP NOW
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {slug === "combos" && <ComboBanner />}
          </>
        ) : (
          <FilteredProductsWrapper
            products={displayProducts}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        )}
      </div>
    </section>
  );
}
