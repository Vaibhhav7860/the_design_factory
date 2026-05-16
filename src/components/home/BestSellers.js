"use client";
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
    badge: "Top Seller",
    image: "https://cdn.shopify.com/s/files/1/0750/4694/5085/files/88E28002-BDF3-426D-9B9A-6D04BC555BAE.png?v=1778577574",
    slug: "bag-tag-mermaid-design-1",
  },
  {
    id: 102,
    title: "Art Bag - Frozen",
    price: 1200,
    badge: null,
    image: "https://cdn.shopify.com/s/files/1/0750/4694/5085/files/3F874BDF-C3FA-47F8-94C3-2C2EA2E8A56D_3b96681b-9de8-400e-b226-40fa33b297cd.png?v=1778577476",
    slug: "iron-on-labels-cute-lil-girl",
  },
  {
    id: 103,
    title: "Jelly Tote Bag - Pink",
    price: 1150,
    badge: "New",
    badgeStyle: "peach",
    image: "https://cdn.shopify.com/s/files/1/0750/4694/5085/files/IMG_4055.webp?v=1778573655",
    slug: "mixed-shape-labels-baby-jungle-animals",
  },
  {
    id: 104,
    title: "Swim Bag with Pouch - Frozen",
    price: 1150,
    badge: null,
    image: "https://cdn.shopify.com/s/files/1/0750/4694/5085/files/IMG_3978.jpg?v=1778573386",
    slug: "iron-on-labels-construction",
  },
];

export default function BestSellers() {
  const { addToCart } = useCart();

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.subtitle}>Carefully curated favorites for your loved ones</p>
          <h2 className={styles.title}>EXPLORE MORE</h2>
        </div>
        <div className={styles.grid}>
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className={styles.cardLink}
            >
              <div className={styles.card}>
                <div className={styles.imageContainer}>
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
                  <div
                    className={styles.quickAdd}
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart({ ...product, originalPrice: null });
                    }}
                  >
                    QUICK ADD
                  </div>
                </div>
                <h4 className={styles.productTitle}>{product.title}</h4>
                <div className={styles.productPrice}>₹ {product.price.toLocaleString("en-IN")}.00</div>
              </div>
            </Link>
          ))}
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
