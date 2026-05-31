"use client";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./category.module.css";

export default function FilterSlider({ subcategories, currentSlug, activeSubcategory }) {
  const sliderRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

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
    return subcategoryImages[sub.slug] || fallbackImages[index % fallbackImages.length];
  };

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-scroll for mobile - show 4 circles at a time
  useEffect(() => {
    if (!isMobile || !sliderRef.current || subcategories.length <= 4) return;

    const container = sliderRef.current;
    let currentIndex = 0;
    
    const autoScroll = setInterval(() => {
      try {
        // Calculate how many items to show (4 at a time)
        const itemsToShow = 4;
        const maxIndex = Math.max(0, subcategories.length - itemsToShow);
        
        currentIndex = (currentIndex + 1) % (maxIndex + 1);
        
        // Calculate scroll position to show 4 items
        const itemWidth = container.scrollWidth / subcategories.length;
        const scrollAmount = currentIndex * itemWidth;
        
        container.scrollTo({
          left: scrollAmount,
          behavior: 'smooth'
        });
      } catch (error) {
        console.error('Auto-scroll error:', error);
      }
    }, 3500); // Change every 3.5 seconds

    return () => clearInterval(autoScroll);
  }, [isMobile, subcategories.length]);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      const container = sliderRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const currentScroll = container.scrollLeft;
      const scrollAmount = Math.min(300, maxScroll - currentScroll);
      
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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
          {subcategories.map((sub, index) => (
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
          ))}
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