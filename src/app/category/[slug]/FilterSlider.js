"use client";
import { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./category.module.css";

export default function FilterSlider({ subcategories, currentSlug, activeSubcategory }) {
  const sliderRef = useRef(null);

  // Move the function inside the client component
  const getSubcategoryImage = (index) => {
    const images = [
      '/images/categories/labels.png',
      '/images/categories/school.png',
      '/images/categories/stationery.png',
      '/images/categories/bags.png',
      '/images/categories/organisers.png',
      '/images/categories/kids_accessories.png',
    ];
    return images[index % images.length];
  };

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

  // Check if we need slider (more than 8 items)
  const needsSlider = subcategories.length > 8;

  if (needsSlider) {
    // Render with slider
    return (
      <div className={styles.filterSection}>
        <button className={styles.filterNavBtn} onClick={scrollLeft}>
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
                    src={getSubcategoryImage(index)}
                    alt={sub.title}
                    width={80}
                    height={80}
                  />
                </div>
                <span>{sub.title}</span>
              </Link>
            ))}
          </div>
        </div>
        <button className={styles.filterNavBtn} onClick={scrollRight}>
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    );
  } else {
    // Render without slider (normal centered layout)
    return (
      <div className={styles.filterSectionNormal}>
        <div className={styles.filterPillsNormal}>
          {subcategories.map((sub, index) => (
            <Link 
              key={sub.slug} 
              href={`/category/${currentSlug}?subcategory=${sub.slug}`}
              className={`${styles.filterPill} ${activeSubcategory === sub.slug ? styles.filterPillActive : ''}`}
            >
              <div className={styles.filterIcon}>
                <Image
                  src={getSubcategoryImage(index)}
                  alt={sub.title}
                  width={80}
                  height={80}
                />
              </div>
              <span>{sub.title}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  }
}