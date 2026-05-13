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
        <span className={`badge ${product.badge === "New" ? "badge-salmon" : "badge-gold"} ${styles.badge}`}>
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
      </Link>
      <div className={styles.info}>
        <Link href={`/product/${product.slug}`}>
          <h3 className={styles.title}>{product.title}</h3>
        </Link>
        <div className={styles.pricing}>
          <span className="price-current">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="price-original">{formatPrice(product.originalPrice)}</span>
          )}
          {discount > 0 && <span className={styles.discount}>{discount}% off</span>}
        </div>
      </div>
      <button
        className={styles.addBtn}
        onClick={() => addToCart(product)}
        aria-label={`Add ${product.title} to cart`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        Quick Add
      </button>
    </div>
  );
}
