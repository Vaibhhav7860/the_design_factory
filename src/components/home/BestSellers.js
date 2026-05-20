"use client";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import styles from "./BestSellers.module.css";

const featuredProducts = [
  {
    id: 101,
    title: "Art Bag - Mermaid",
    price: 1200,
    originalPrice: 1500,
    discount: 20,
    badge: "Top Seller",
    image: "https://cdn.shopify.com/s/files/1/0750/4694/5085/files/88E28002-BDF3-426D-9B9A-6D04BC555BAE.png?v=1778577574",
    slug: "bag-tag-mermaid-design-1",
  },
  {
    id: 102,
    title: "Art Bag - Frozen",
    price: 1200,
    originalPrice: 1500,
    discount: 20,
    badge: null,
    image: "https://cdn.shopify.com/s/files/1/0750/4694/5085/files/3F874BDF-C3FA-47F8-94C3-2C2EA2E8A56D_3b96681b-9de8-400e-b226-40fa33b297cd.png?v=1778577476",
    slug: "iron-on-labels-cute-lil-girl",
  },
  {
    id: 103,
    title: "Jelly Tote Bag - Pink",
    price: 1150,
    originalPrice: 1450,
    discount: 21,
    badge: "New",
    badgeStyle: "peach",
    image: "https://cdn.shopify.com/s/files/1/0750/4694/5085/files/IMG_4055.webp?v=1778573655",
    slug: "mixed-shape-labels-baby-jungle-animals",
  },
  {
    id: 104,
    title: "Swim Bag with Pouch - Frozen",
    price: 1150,
    originalPrice: 1450,
    discount: 21,
    badge: null,
    image: "https://cdn.shopify.com/s/files/1/0750/4694/5085/files/IMG_3978.jpg?v=1778573386",
    slug: "iron-on-labels-construction",
  },
  {
    id: 105,
    title: "Art Bag - Unicorn",
    price: 1250,
    originalPrice: 1600,
    discount: 22,
    badge: "Must Have",
    badgeStyle: "peach",
    image: "/images/products/art_bag_unicorn.png",
    slug: "art-bag-unicorn",
  },
  {
    id: 106,
    title: "Art Bag - Dinosaur",
    price: 1250,
    originalPrice: 1600,
    discount: 22,
    badge: "Trending",
    badgeStyle: "blue",
    image: "/images/products/art_bag_dinosaur.png",
    slug: "art-bag-dinosaur",
  },
];

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
          <h2 className={styles.title}>Explore More</h2>
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
              key={product.id}
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
                    src={product.image}
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
