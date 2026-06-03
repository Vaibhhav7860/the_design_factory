"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import ProductCard from "@/components/product/ProductCard";
import styles from "./product.module.css";

export default function RelatedProductsSlider({ products }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const touchStartRef = useRef(false);
  const containerRef = useRef(null);
  const isProgrammaticScrollRef = useRef(false);

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

  const maxIndex = Math.max(0, products.length - itemsPerPage);

  // Auto-slide functionality
  const startAutoSlide = useCallback(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Only start if we have slides and not paused
    if (maxIndex > 0 && !isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const next = prev + 1;
          return next > maxIndex ? 0 : next;
        });
      }, 3000); // Auto-slide every 3 seconds
    }
  }, [maxIndex, isPaused]);

  const stopAutoSlide = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start/stop auto-slide based on pause state
  useEffect(() => {
    if (isPaused || maxIndex === 0) {
      stopAutoSlide();
    } else {
      startAutoSlide();
    }

    return () => stopAutoSlide();
  }, [isPaused, maxIndex, startAutoSlide, stopAutoSlide]);

  // Keep index within bounds if size changes
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [itemsPerPage, maxIndex, currentIndex]);

  // Sync scroll position for mobile
  useEffect(() => {
    if (isMobile && containerRef.current) {
      const container = containerRef.current;
      const item = container.querySelector(`[data-slider-item="true"]`);
      if (item) {
        isProgrammaticScrollRef.current = true;
        const gap = 14; 
        container.scrollTo({
          left: currentIndex * (item.offsetWidth + gap),
          behavior: 'smooth'
        });
        setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 600); // Wait for smooth scroll to finish
      }
    }
  }, [currentIndex, isMobile]);

  const handleScroll = (e) => {
    if (!isMobile || isProgrammaticScrollRef.current) return;
    const item = e.target.querySelector(`[data-slider-item="true"]`);
    if (item) {
      const itemWidth = item.offsetWidth + 14;
      const newIndex = Math.round(e.target.scrollLeft / itemWidth);
      if (newIndex !== currentIndex && newIndex <= maxIndex) {
        setCurrentIndex(newIndex);
      }
    }
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const handleDotClick = (idx) => {
    setCurrentIndex(idx);
  };

  // Desktop hover handlers
  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsPaused(false);
    }
  };

  // Mobile touch handlers - pause while touching
  const handleTouchStart = () => {
    touchStartRef.current = true;
    setIsPaused(true);
  };

  const handleTouchEnd = () => {
    touchStartRef.current = false;
    // Resume auto-slide after a short delay
    setTimeout(() => {
      if (!touchStartRef.current) {
        setIsPaused(false);
      }
    }, 100);
  };

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < maxIndex;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div 
      className={styles.sliderWrapper} 
      style={{ "--slider-gap": "24px" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
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

      <div 
        className={styles.sliderContainer}
        ref={containerRef}
        onScroll={handleScroll}
      >
        <div 
          className={styles.sliderTrack} 
          style={{ 
            transform: isMobile ? 'none' : `translateX(calc(-1 * ${currentIndex} * (100% + var(--slider-gap, 24px)) / ${itemsPerPage}))`
          }}
        >
          {products.map((p) => (
            <div key={p.slug} className={styles.sliderItem} data-slider-item="true">
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
              onClick={() => handleDotClick(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
