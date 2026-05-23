import { categories, getCategoryBySlug } from "@/data/categories";
import { getProductsByCategory, getProductsBySubcategory, products } from "@/data/products";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";
import Image from "next/image";
import FilterSlider from "./FilterSlider";
import FilteredProductsWrapper from "./FilteredProductsWrapper";
import styles from "./category.module.css";

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

// Eyebrow text based on category
function getEyebrowText(slug) {
  const eyebrows = {
    "labels": "PREMIUM PERSONALIZED",
    "school-essentials": "BACK TO SCHOOL",
    "gift-stationery": "HANDCRAFTED WITH LOVE",
    "adults-corner": "SOPHISTICATED & ELEGANT",
    "decor-dining": "ELEVATE YOUR SPACE",
    "travel-essentials": "TRAVEL IN STYLE",
    "organisers": "STAY ORGANIZED",
    "bags": "CARRY YOUR STYLE",
    "kids-accessories": "FUN & FUNCTIONAL",
    "accessories-gifts": "UNIQUE & PERSONAL",
    "combos": "VALUE-PACKED SETS",
    "play-learn": "LEARN THROUGH PLAY",
    "themes": "SHOP BY THEME",
  };
  return eyebrows[slug] || "EXPLORE OUR COLLECTION";
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const subcategory = (await searchParams)?.subcategory;
  const category = getCategoryBySlug(slug);
  
  // If no subcategory is selected and category has subcategories, show subcategory grid
  const showSubcategories = !subcategory && category?.subcategories && category.subcategories.length > 0;
  
  // Get products based on whether subcategory is selected
  let catProducts;
  if (subcategory) {
    catProducts = getProductsBySubcategory(slug, subcategory);
  } else {
    catProducts = getProductsByCategory(slug);
  }
  
  const displayProducts = catProducts.length > 0 ? catProducts : [];
  
  // Calculate min and max prices from all products in this category
  let minPrice = 0; // Always start from 0
  let maxPrice = 100000;
  if (displayProducts.length > 0) {
    const prices = displayProducts.map(p => p.price).filter(p => p);
    maxPrice = Math.max(...prices); // Set to highest product price
  }

  // Subcategory-specific images
  const subcategoryImages = {
    'rectangular-labels': '/images/categories/rectangular-labels.png',
    'round-labels': '/images/categories/round-labels.png',
    'mixed-shape-labels': '/images/categories/mixed-shape-labels.png',
    'transparent-labels': '/images/categories/transparent-labels.png',
    '3d-embossed-stickers': '/images/categories/3d-embossed-stickers.png',
    'school-book-labels': '/images/categories/school-book-labels.png',
    'iron-on-labels': '/images/categories/iron-on-labels.png',
  };

  const fallbackImages = [
    '/images/categories/labels.png',
    '/images/categories/school.png',
    '/images/categories/stationery.png',
    '/images/categories/bags.png',
    '/images/categories/organisers.png',
    '/images/categories/kids_accessories.png',
  ];

  const getSubcategoryImage = (sub, index) => {
    return subcategoryImages[sub.slug] || fallbackImages[index % fallbackImages.length];
  };

  // Get current subcategory details
  const currentSubcategory = subcategory 
    ? category?.subcategories?.find(sub => sub.slug === subcategory)
    : null;

  return (
    <section className={styles.page} style={{ marginTop: "var(--nav-height)" }}>
      <div className="container">
        {/* Hero Header Area with Pastel Gradient */}
        <div className={styles.headerArea}>
          {/* Section Header */}
          <div className={styles.sectionHeader}>
            <h2>{currentSubcategory?.title || category?.title || slug}</h2>
          </div>
        </div>

        {/* Subcategory Filter Pills — outside the header card */}
        {!showSubcategories && category?.subcategories && category.subcategories.length > 0 && (
          <FilterSlider 
            subcategories={category.subcategories}
            currentSlug={slug}
            activeSubcategory={subcategory}
          />
        )}

        {/* Show Subcategory Cards if no subcategory is selected */}
        {showSubcategories ? (
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
                      <h3 className={styles.showcaseTitle}>{sub.title.toUpperCase()}</h3>
                      <button className={styles.showcaseButton}>SHOP NOW</button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <>
            {/* Filtered Products with Sidebar */}
            <FilteredProductsWrapper 
              products={displayProducts}
              minPrice={minPrice}
              maxPrice={maxPrice}
            />
          </>
        )}
      </div>
    </section>
  );
}
