"use client";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { products } from "@/data/products";
import styles from "./BestSellers.module.css";

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
  "duffle-bag-with-toy-keychain-frozen": { badge: "Trending", badgeStyle: "blue" },
};

const featuredProducts = SEASON_SLUGS.map((slug) => {
  const p = products.find((prod) => prod.slug === slug);
  if (!p) return null;
  const discount = p.originalPrice
    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
    : 0;
  return {
    ...p,
    discount,
    ...(BADGES[slug] || {}),
  };
}).filter(Boolean);

export default function BestSellers() {
  const { addToCart } = useCart();
  const sliderRef = useRef(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Season's Picks</h2>
        </div>
        <div className={styles.carouselWrapper}>
          <button className={`${styles.navButton} ${styles.navLeft}`} onClick={scrollLeft} aria-label="Scroll left">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          
          <div className={styles.grid} ref={sliderRef}>
            {featuredProducts.map((product, index) => {
              const borderColor = ['#FCD589', '#FBC9BC', '#d7e4e4', '#E6D7FF', '#D4F0F0', '#FFD8B1'][index % 6];
              return (
            <Link
              key={product.slug}
              href={`/product/${product.slug}`}
              className={styles.cardLink}
            >
              <div className={styles.card}>
                <div 
                  className={styles.imageContainer}
                  style={{ border: `6px solid ${borderColor}` }}
                >
                  <div className={styles.wishlistIcon}>
                    <svg viewBox="0 0 24 24">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </div>
                  {product.badge && (
                    <span
                      className={`${styles.badge} ${product.badgeStyle === "peach" ? styles.badgePeach : ""}`}
                    >
                      {product.badge}
                    </span>
                  )}
                  <Image
                    src={product.images?.[0] || "/placeholder.jpg"}
                    alt={product.title}
                    width={400}
                    height={380}
                    className={styles.productImage}
                  />
                </div>
                <h4 className={styles.productTitle}>{product.title}</h4>
                <div className={styles.priceContainer}>
                  <span className={styles.productPrice}>₹{product.price.toLocaleString("en-IN")}</span>
                  {product.originalPrice && (
                    <>
                      <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString("en-IN")}</span>
                      <span className={styles.discount}>{product.discount}% OFF</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
            );
          })}
          </div>
          
          <button className={`${styles.navButton} ${styles.navRight}`} onClick={scrollRight} aria-label="Scroll right">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
        <div className={styles.viewAllWrap}>
          <Link href="/category/bags" className={styles.viewAllBtn}>
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
