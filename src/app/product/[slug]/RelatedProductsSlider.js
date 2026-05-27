"use client";
import { useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import styles from "./product.module.css";

export default function RelatedProductsSlider({ products }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const goToPrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - itemsPerPage));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => 
      Math.min(products.length - itemsPerPage, prev + itemsPerPage)
    );
  };

  const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerPage);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex + itemsPerPage < products.length;

  return (
    <div className={styles.sliderWrapper}>
      {canGoPrev && (
        <button 
          className={`${styles.sliderBtn} ${styles.sliderBtnPrev}`}
          onClick={goToPrev}
          aria-label="Previous products"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      <div className={styles.relatedGrid}>
        {visibleProducts.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>

      {canGoNext && (
        <button 
          className={`${styles.sliderBtn} ${styles.sliderBtnNext}`}
          onClick={goToNext}
          aria-label="Next products"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Pagination dots */}
      <div className={styles.sliderDots}>
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            className={`${styles.sliderDot} ${
              Math.floor(currentIndex / itemsPerPage) === idx ? styles.sliderDotActive : ""
            }`}
            onClick={() => setCurrentIndex(idx * itemsPerPage)}
            aria-label={`Go to page ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
