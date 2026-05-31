"use client";
import { useState, useEffect } from "react";
import ProductCard from "@/components/product/ProductCard";
import styles from "./product.module.css";

export default function RelatedProductsSlider({ products }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setItemsPerPage(2);
      } else if (window.innerWidth <= 1024) {
        setItemsPerPage(3);
      } else {
        setItemsPerPage(6);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-slide removed - let user control navigation manually

  const maxIndex = Math.max(0, products.length - itemsPerPage);

  // Keep index within bounds if size changes
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [itemsPerPage, maxIndex, currentIndex]);

  const goToPrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < maxIndex;

  return (
    <div className={styles.sliderWrapper} style={{ "--slider-gap": "24px" }}>
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

      <div className={styles.sliderContainer}>
        <div 
          className={styles.sliderTrack} 
          style={{ 
            transform: `translateX(calc(-1 * ${currentIndex} * (100% + var(--slider-gap, 24px)) / ${itemsPerPage}))`
          }}
        >
          {products.map((p) => (
            <div key={p.slug} className={styles.sliderItem}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
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
      {maxIndex > 0 && (
        <div className={styles.sliderDots}>
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              className={`${styles.sliderDot} ${
                currentIndex === idx ? styles.sliderDotActive : ""
              }`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
