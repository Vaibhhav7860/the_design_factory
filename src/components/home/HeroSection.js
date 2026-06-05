"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./HeroSection.module.css";

const PrevIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const NextIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;

const slides = [
  { type: 'video', src: 'https://media.thedesignfactoryshop.com/videos/hero_video_optimized.mp4', duration: 15000 }
];

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef(null);
  const videoRef = useRef(null);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const currentSlide = slides[currentIndex];
    
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // If it's a video, play it and wait for its duration
    if (currentSlide.type === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(err => console.log('Video play error:', err));
      
      // Set timer for video duration
      timerRef.current = setTimeout(() => {
        goToNext();
      }, currentSlide.duration);
    } else {
      // For images, use the image duration
      timerRef.current = setTimeout(() => {
        goToNext();
      }, currentSlide.duration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentIndex]);

  const handlePrev = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    goToPrev();
  };

  const handleNext = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    goToNext();
  };

  return (
    <section className={styles.hero}>
      {/* Hero Slider */}
      <div 
        className={styles.heroSlider}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className={styles.heroSlide}>
            {slide.type === 'image' ? (
              <Image
                src={slide.src}
                alt="The Design Factory - Personalized Gifts"
                fill
                className={styles.slideMedia}
                priority={index === 0}
              />
            ) : (
              <div
                ref={(el) => {
                  if (el && index === currentIndex) {
                    videoRef.current = el.querySelector('video');
                  }
                }}
                className={styles.slideMedia}
                dangerouslySetInnerHTML={{
                  __html: `
                    <video
                      src="${slide.src}"
                      autoplay
                      loop
                      muted
                      playsinline
                      preload="auto"
                      style="width: 100%; height: 100%; object-fit: cover;"
                    ></video>
                  `
                }}
              />
            )}
          </div>
        ))}
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
