"use client";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const discount = calculateDiscount(product.originalPrice, product.price);

  return (
    <div className={styles.card}>
      {product.badge && (
        <span
          className={`${styles.badge} ${product.badge === "New" ? styles.badgeNew : ""}`}
        >
          {product.badge}
        </span>
      )}
      <Link href={`/product/${product.slug}`} className={styles.imageWrap}>
        <div className={styles.imageBg}>
          <Image
            src={product.image}
            alt={product.title}
            width={300}
            height={300}
            className={styles.image}
          />
        </div>
        <div className={styles.wishlistIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
      </Link>
      <div className={styles.info}>
        <Link href={`/product/${product.slug}`}>
          <h3 className={styles.title}>{product.title}</h3>
        </Link>
        <div className={styles.pricing}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
          )}
          {discount > 0 && <span className={styles.discount}>{discount}% off</span>}
        </div>
      </div>
      <button
        className={styles.addBtn}
        onClick={() => addToCart(product)}
        aria-label={`Add ${product.title} to cart`}
      >
        QUICK ADD
      </button>
    </div>
  );
}
