"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { useCart } from "@/context/CartContext";
import styles from "./page.module.css";

/**
 * Client-side renderer for the Make-a-Combo page. The parent server
 * page does all data fetching from MongoDB and hands us a ready-made
 * list of buckets, each with a pre-trimmed `products` array.
 */
export default function MakeComboClient({ buckets }) {
  const [activeCategory, setActiveCategory] = useState(buckets[0]?.id || "");
  const { cart, addToCart, removeFromCart } = useCart();
  const [toastMessage, setToastMessage] = useState(null);
  const [toastTimeoutId, setToastTimeoutId] = useState(null);

  const activeBucket =
    buckets.find((b) => b.id === activeCategory) || { products: [] };
  const categoryProducts = activeBucket.products;

  const triggerToast = (message) => {
    if (toastTimeoutId) clearTimeout(toastTimeoutId);
    setToastMessage(message);
    const id = setTimeout(() => setToastMessage(null), 2500);
    setToastTimeoutId(id);
  };

  const selectedProducts = cart.filter((item) => item.isComboItem);

  const isSelected = (product) =>
    cart.some((item) => item.slug === `${product.slug}__combo`);

  const toggleProduct = (product) => {
    const comboSlug = `${product.slug}__combo`;
    if (isSelected(product)) {
      removeFromCart(comboSlug);
      triggerToast(`Removed "${product.title}" from your combo`);
    } else {
      addToCart({ ...product, slug: comboSlug, isComboItem: true });
      triggerToast(`Added "${product.title}" to your combo`);
    }
  };

  const totalCount = selectedProducts.reduce(
    (sum, p) => sum + p.quantity,
    0
  );

  return (
    <main className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Make Your Own Combo</h1>
        <p className={styles.heroSubtitle}>
          Choose any 3 products and get 10% off • Choose 5+ and get 20% off
        </p>
      </section>

      {/* Category Circles */}
      <section className={styles.categories}>
        <div className={styles.categoryCircles}>
          {buckets.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.categoryCircle} ${
                activeCategory === cat.id ? styles.active : ""
              }`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <div className={styles.circleImage}>
                <Image
                  src={cat.image}
                  alt={cat.label}
                  width={120}
                  height={120}
                />
              </div>
              <span className={styles.circleLabel}>{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Floating Checkout Button */}
      {selectedProducts.length > 0 && (
        <div className={styles.floatingBar}>
          <Link href="/cart" className={styles.floatingBtn}>
            View Cart & Checkout
            {totalCount > 0 && (
              <span className={styles.floatingCount}>{totalCount}</span>
            )}
          </Link>
        </div>
      )}

      {/* Products Grid */}
      <section className={styles.productsSection}>
        <div className="container">
          <div className={styles.productsGrid}>
            {categoryProducts.map((product) => (
              <div
                key={product.slug}
                className={`${styles.productWrapper} ${
                  isSelected(product) ? styles.selected : ""
                }`}
                onClick={() => toggleProduct(product)}
              >
                <div className={styles.checkboxContainer}>
                  <div className={styles.customCheckbox}>
                    <svg viewBox="0 0 24 24" className={styles.checkmark}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
                <ProductCard product={product} disableLinks={true} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {toastMessage && (
        <div className={styles.toast}>
          <div className={styles.toastContent}>
            <span className={styles.toastTick}>✓</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </main>
  );
}
