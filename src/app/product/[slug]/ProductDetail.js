"use client";
import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import styles from "./product.module.css";

export default function ProductDetail({ product }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const discount = calculateDiscount(product.originalPrice, product.price);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className={styles.detail}>
      {/* Gallery */}
      <div className={styles.gallery}>
        <div className={styles.mainImage}>
          <Image src={product.image} alt={product.title} width={500} height={500} className={styles.img} />
        </div>
      </div>

      {/* Info */}
      <div className={styles.info}>
        {product.badge && (
          <span className={`badge ${product.badge === "New" ? "badge-salmon" : "badge-gold"}`}>
            {product.badge}
          </span>
        )}
        <h1 className={styles.title}>{product.title}</h1>
        <div className={styles.pricing}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          {product.originalPrice && <span className={styles.original}>{formatPrice(product.originalPrice)}</span>}
          {discount > 0 && <span className={styles.discountBadge}>{discount}% OFF</span>}
        </div>
        <p className={styles.desc}>{product.description}</p>

        {product.features && (
          <div className={styles.features}>
            {product.features.map((f) => (
              <span key={f} className={styles.feature}>✦ {f}</span>
            ))}
          </div>
        )}

        {/* Quantity */}
        <div className={styles.qtyRow}>
          <span className={styles.qtyLabel}>Quantity</span>
          <div className={styles.qtyControl}>
            <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
            <span>{qty}</span>
            <button onClick={() => setQty(qty + 1)}>+</button>
          </div>
        </div>

        <button className={styles.addBtn} onClick={handleAdd}>
          {added ? "✓ Added to Cart!" : "Add to Cart"}
        </button>

        <a href="https://wa.me/919981133225" target="_blank" rel="noopener noreferrer" className={styles.whatsapp}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.625-1.469A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.487 0-4.78-.809-6.643-2.177l-.463-.348-2.738.87.907-2.677-.381-.489A9.945 9.945 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
          Order via WhatsApp
        </a>
      </div>
    </div>
  );
}
