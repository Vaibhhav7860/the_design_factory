"use client";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import styles from "./ProductCard.module.css";

const TAG_OPTIONS = ["Express", "New", "Trending", "New Drop", "Top Pick", "Most 💖"];
const TAG_COLORS = ["#FCD589", "#FBC9BC", "#d7e4e4"];

// Deterministic hash so tags stay stable between server / client renders
function hashStr(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Pick 2 deterministic tags for a product that has none stored on the
 * document. Mirrors `scripts/migrate-product-tags.js` exactly so the
 * fallback values match what the migration writes — no visual jump
 * before/after a product is migrated.
 */
function deriveProductTags(product) {
  const seed = hashStr(product.slug || product.title || "");
  const count = 2;

  const tags = [];
  const used = new Set();
  for (let i = 0; i < count; i++) {
    const tagIdx = (seed + i * 7) % TAG_OPTIONS.length;
    let chosen = tagIdx;
    while (used.has(chosen)) {
      chosen = (chosen + 1) % TAG_OPTIONS.length;
    }
    used.add(chosen);
    tags.push({
      label: TAG_OPTIONS[chosen],
      color: TAG_COLORS[(seed + i) % TAG_COLORS.length],
    });
  }
  return tags;
}

/**
 * Tags the card should render. Prefers the values stored on the
 * product document (which is what the admin saved or the migration
 * wrote). Falls back to the deterministic derivation only if the
 * document has no tags at all.
 */
function resolveProductTags(product) {
  if (Array.isArray(product.tags) && product.tags.length > 0) {
    return product.tags
      .filter((t) => t && t.label)
      .map((t) => ({
        label: t.label,
        color: t.color || TAG_COLORS[0],
      }));
  }
  return deriveProductTags(product);
}

export default function ProductCard({ product, disableLinks = false }) {
  const { addToCart } = useCart();
  const discount = calculateDiscount(product.originalPrice, product.price);
  // Use images[] if available, fall back to [image]
  const gallery = product.images?.length > 0 ? product.images : [product.image];
  const hasMultiple = gallery.length > 1;
  const tags = resolveProductTags(product);

  return (
    <div className={styles.card}>
      {product.badge && (
        <span className={`${styles.badge} ${product.badge === "New" ? styles.badgeNew : ""}`}>
          {product.badge}
        </span>
      )}

      {disableLinks ? (
        <div className={styles.imageWrap}>
          <div className={styles.imageBg}>
            {/* Image strip — scrolls right-to-left on hover when multiple images */}
            <div className={`${styles.imageStrip} ${hasMultiple ? styles.imageStripMulti : ""}`}>
              {gallery.slice(0, 5).map((src, i) => (
                <div key={i} className={styles.imageSlide}>
                  <Image
                    src={src}
                    alt={`${product.title} — image ${i + 1}`}
                    width={400}
                    height={400}
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className={styles.image}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <Link href={`/product/${product.slug}`} className={styles.imageWrap}>
          <div className={styles.imageBg}>
            {/* Image strip — scrolls right-to-left on hover when multiple images */}
            <div className={`${styles.imageStrip} ${hasMultiple ? styles.imageStripMulti : ""}`}>
              {gallery.slice(0, 5).map((src, i) => (
                <div key={i} className={styles.imageSlide}>
                  <Image
                    src={src}
                    alt={`${product.title} — image ${i + 1}`}
                    width={400}
                    height={400}
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className={styles.image}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.wishlistIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
        </Link>
      )}

      <div className={styles.info}>
        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((tag, i) => (
              <span
                key={i}
                className={styles.tag}
                style={{ backgroundColor: tag.color }}
              >
                {tag.label}
              </span>
            ))}
          </div>
        )}
        {disableLinks ? (
          <h3 className={styles.title}>{product.title}</h3>
        ) : (
          <Link href={`/product/${product.slug}`}>
            <h3 className={styles.title}>{product.title}</h3>
          </Link>
        )}
        <div className={styles.pricing}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          {discount > 0 && product.originalPrice && (
            <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
          )}
          {discount > 0 && <span className={styles.discount}>{discount}% off</span>}
        </div>
      </div>
    </div>
  );
}
