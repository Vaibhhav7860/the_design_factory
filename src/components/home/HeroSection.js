"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./HeroSection.module.css";

const PrevIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const NextIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % 2);
    }, 4000); // slightly longer so user can read/click
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + 2) % 2);
  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % 2);

  return (
    <section className={styles.hero}>
      {/* Hero Slider */}
      <div 
        className={styles.heroSlider}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        <div className={styles.heroSlide}>
          <Image
            src="/images/hero_banner.png"
            alt="The Design Factory - Personalized Gifts"
            fill
            className={styles.slideMedia}
            priority
          />
        </div>
        <div className={styles.heroSlide}>
          <video
            src="/videos/hero_video.mp4"
            autoPlay
            loop
            muted
            playsInline
            className={styles.slideMedia}
          />
        </div>
      </div>

      {/* Navigation Arrows */}
      <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={handlePrev} aria-label="Previous slide">
        <PrevIcon />
      </button>
      <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={handleNext} aria-label="Next slide">
        <NextIcon />
      </button>

      {/* Overlay Gradient */}
      <div className={styles.overlay} />

      {/* CTA Button */}
      <div className={styles.heroCta}>
        <Link href="/explore" className={styles.exploreBtn}>
          Explore Collection
        </Link>
      </div>
    </section>
  );
}
