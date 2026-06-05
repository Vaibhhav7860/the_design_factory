"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./category.module.css";

export default function FilterSlider({ subcategories, currentSlug, activeSubcategory }) {
  const sliderRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const intervalRef = useRef(null);

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
      return sub.circleImage || sub.image || fallbackImages[index % fallbackImages.length];
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

  // Auto-scroll function for mobile
  const autoScroll = useCallback(() => {
    if (!sliderRef.current || !isMobile) return;
    
    try {
      const container = sliderRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const currentScroll = container.scrollLeft;
      
      // If we're at the end, loop back to start
      if (currentScroll >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Scroll by one circle width (approximately 25% of viewport width)
        const scrollAmount = window.innerWidth * 0.25;
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Auto-scroll error:', error);
    }
  }, [isMobile]);

  // Set up auto-scroll interval for mobile only
  useEffect(() => {
    if (!isClient || !isMobile) return;
    
    // Start auto-scrolling every 2 seconds
    intervalRef.current = setInterval(autoScroll, 2000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isClient, isMobile, autoScroll]);

  // Pause auto-scroll on touch (mobile)
  useEffect(() => {
    if (!isClient || !isMobile || !sliderRef.current) return;
    
    const container = sliderRef.current;
    
    const handleTouchStart = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    
    const handleTouchEnd = () => {
      // Resume auto-scroll after touch ends
      intervalRef.current = setInterval(autoScroll, 2000);
    };
    
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isClient, isMobile, autoScroll]);
  
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
                    {console.log('Rendering Circle Image for', sub.title, 'URL:', getSubcategoryImage(sub, index))}
                    <Image
                      src={getSubcategoryImage(sub, index)}
                      alt={sub.title}
                      width={110}
                      height={110}
                    />
                  </div>
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