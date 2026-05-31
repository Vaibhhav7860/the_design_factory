"use client";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./category.module.css";

export default function FilterSlider({ subcategories, currentSlug, activeSubcategory }) {
  const sliderRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Subcategory-specific images
  const subcategoryImages = {
    'rectangular-labels': '/images/categories/rectangular-labels.png',
    'round-labels': '/images/categories/round-labels.png',
    'mixed-shape-labels': '/images/categories/mixed-shape-labels.png',
    'transparent-labels': '/images/categories/transparent-labels.png',
    '3d-embossed-stickers': '/images/categories/3d-embossed-stickers.png',
    'school-book-labels': '/images/categories/school-book-labels.png',
    'iron-on-labels': '/images/categories/iron-on-labels.png',
  };

  const fallbackImages = [
    '/images/categories/labels.png',
    '/images/categories/school.png',
    '/images/categories/stationery.png',
    '/images/categories/bags.png',
    '/images/categories/organisers.png',
    '/images/categories/kids_accessories.png',
  ];

  const getSubcategoryImage = (sub, index) => {
    try {
      return subcategoryImages[sub.slug] || fallbackImages[index % fallbackImages.length];
    } catch (error) {
      console.error('Error getting subcategory image:', error);
      return fallbackImages[0];
    }
  };

  // Client-side only rendering for iOS compatibility
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Detect mobile
  useEffect(() => {
    if (!isClient) return;
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [isClient]);

  // Auto-scroll removed - manual navigation only
  
  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (!sliderRef.current) return;
    
    try {
      const container = sliderRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const currentScroll = container.scrollLeft;
      const scrollAmount = Math.min(300, maxScroll - currentScroll);
      
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    } catch (error) {
      console.error('Scroll error:', error);
    }
  };

  // Don't render until client-side for iOS compatibility
  if (!isClient) {
    return null;
  }

  // Safety check
  if (!subcategories || subcategories.length === 0) {
    return null;
  }

  // Always use the slider layout as requested by the user
  return (
    <div className={styles.filterSection}>
      <button className={styles.filterNavBtn} onClick={scrollLeft} aria-label="Previous">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <div className={styles.filterContainer}>
        <div className={styles.filterPills} ref={sliderRef}>
          {subcategories.map((sub, index) => {
            try {
              return (
                <Link 
                  key={sub.slug} 
                  href={`/category/${currentSlug}?subcategory=${sub.slug}`}
                  className={`${styles.filterPill} ${activeSubcategory === sub.slug ? styles.filterPillActive : ''}`}
                >
                  <div className={styles.filterIcon}>
                    <Image
                      src={getSubcategoryImage(sub, index)}
                      alt={sub.title}
                      width={110}
                      height={110}
                    />
                  </div>
                  <span>{sub.title}</span>
                </Link>
              );
            } catch (error) {
              console.error('Error rendering subcategory:', sub, error);
              return null;
            }
          })}
        </div>
      </div>
      <button className={styles.filterNavBtn} onClick={scrollRight} aria-label="Next">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  );
}