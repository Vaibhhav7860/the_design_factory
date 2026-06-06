import { connectToDatabase } from "@/lib/db/mongoose";
import { Category } from "@/lib/db/models";
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

export async function generateMetadata({ params }) {
  const { slug } = await params;
  await connectToDatabase();
  const cat = await Category.findOne({ slug }).lean();
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
  
  await connectToDatabase();
  let category = await Category.findOne({ slug }).lean();
  if (category) {
    category = JSON.parse(JSON.stringify(category));
  }

  // Pick subcategory grid view OR product grid view
  const showSubcategories =
    !subcategory && category?.subcategories && category.subcategories.length > 0;

  // ── Mongo-backed product lookup ──
  // A product whose `categories` array contains <slug> is included.
  // If subcategory is also active, it must additionally have it in
  // `subcategories`. So a product belonging to both labels +
  // school-essentials shows up under both /category/labels and
  // /category/school-essentials.
  //
  // Only fetch products when the product grid will actually render. On a
  // subcategory-showcase landing (showSubcategories) the products are never
  // shown, so fetching the whole category (hundreds of docs) was pure waste.
  const displayProducts = showSubcategories
    ? []
    : subcategory
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
    sub.image ||
    subcategoryImages[sub.slug] ||
    fallbackImages[index % fallbackImages.length];

  const currentSubcategory = subcategory
    ? category?.subcategories?.find((sub) => sub.slug === subcategory)
    : null;

  const headingText = currentSubcategory?.title || category?.title || slug;

  const renderHeading = (text) => {
    if (typeof text === 'string' && text.toUpperCase() === '3D GIFT TAGS') {
      return (
        <>
          <span style={{ fontFamily: '"Times New Roman", serif', fontWeight: 400 }}>3</span>D GIFT TAGS
        </>
      );
    }
    return text;
  };

  return (
    <section className={styles.page} style={{ marginTop: "var(--nav-height)" }}>
      <div className={styles.headerArea}>
        <div className={styles.sectionHeader}>
          <h2>{renderHeading(headingText)}</h2>
        </div>
      </div>

      {/* Move FilterSlider outside headerArea so it's on white background */}
      {!showSubcategories &&
        category?.subcategories &&
        category.subcategories.length > 0 && (
          <FilterSlider
            subcategories={category.subcategories}
            currentSlug={slug}
            activeSubcategory={subcategory}
          />
        )}

      <div className="container">
        {showSubcategories ? (
          <>
            <div className={styles.subcategoryShowcase}>
              {category.subcategories.map((sub, index) => (
                <div
                  key={sub.slug}
                  className="flex"
                >
                  <Link
                    href={`/category/${slug}?subcategory=${sub.slug}`}
                    className={`${styles.showcaseCard} flex-1 min-h-[44px] min-w-[44px] touch-manipulation`}
                    style={{ animation: 'none', opacity: 1 }} // Override css-module animation
                  >
                    <div className={styles.showcaseImageWrapper}>
                      <Image
                        src={getSubcategoryImage(sub, index)}
                        alt={sub.title}
                        width={600}
                        height={400}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className={styles.showcaseImage}
                      />
                      <div className={`${styles.showcaseOverlay} min-h-[60px]`}>
                        <div className={styles.showcaseContent}>
                          <h3 className={styles.showcaseTitle}>
                            {sub.title.toUpperCase()}
                          </h3>
                          <button
                            className={`${styles.showcaseButton} min-h-[44px] min-w-[44px] px-6 py-3 flex items-center justify-center`}
                            style={{
                              "--btn-bg": ["#FCD589", "#FBC9BC", "#d7e4e4"][
                                index % 3
                              ],
                            }}
                            aria-label={`Shop ${sub.title}`}
                          >
                            SHOP NOW
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
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
