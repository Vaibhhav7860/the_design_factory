"use client";
import React, { useRef, useState } from "react";
import { testimonials } from "@/data/testimonials";
import styles from "./Testimonials.module.css";

export default function Testimonials() {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 350; // Card width + gap
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const pastelColors = [
    "#E6F4F1", "#FDF1F5", "#FCF7E3",
    "#FDF7F1", "#F9FDF1", "#F1FDFD",
    "#FDF1F1", "#FCF7E3",
  ];

  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        
        <h2 className={styles.mainHeading}>What our Clients Say</h2>

        <div className={styles.carouselWrapper}>
          {/* Navigation Arrows */}
          <button className={`${styles.navButton} ${styles.navLeft}`} onClick={() => scroll("left")} aria-label="Previous">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          
          <div 
            className={`${styles.slider} ${isDragging ? styles.dragging : ""}`} 
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {testimonials.map((t, index) => (
              <div 
                key={t.id} 
                className={styles.cardShell}
              >
                <div 
                  className={styles.cardCore}
                  style={{ backgroundColor: pastelColors[index % pastelColors.length] }}
                >
                  <p className={styles.text}>&quot;{t.text}&quot;</p>
                  <div className={styles.author}>
                    <div className={styles.avatar}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                      </svg>
                    </div>
                    <div className={styles.authorInfo}>
                      <h4 className={styles.name}>{t.name}, {t.city}</h4>
                      <p className={styles.heading}>{t.heading}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className={`${styles.navButton} ${styles.navRight}`} onClick={() => scroll("right")} aria-label="Next">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <div className={styles.bottomLine}></div>
      </div>
    </section>
  );
}
