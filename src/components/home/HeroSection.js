"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./HeroSection.module.css";

const PrevIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const NextIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const FALLBACK_SLIDES = [
  { url: "https://media.thedesignfactoryshop.com/videos/hero_video_optimized.mp4" },
];

/**
 * @param {{ slides?: {url: string}[], mediaType?: 'video' | 'image' }} props
 */
export default function HeroSection({ slides: slidesProp, mediaType: mediaTypeProp }) {
  const slides = slidesProp?.length ? slidesProp : FALLBACK_SLIDES;
  const mediaType = mediaTypeProp || "video";

  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef([]);
  const imageTimerRef = useRef(null);

  const goToNext = useCallback(
    () => setCurrentIndex((prev) => (prev + 1) % slides.length),
    [slides.length]
  );
  const goToPrev = useCallback(
    () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length),
    [slides.length]
  );

  // Reset to first slide whenever the slide list changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [slides]);

  // Video playback: pause all, then play current
  useEffect(() => {
    if (mediaType !== "video") return;
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i !== currentIndex) {
        v.pause();
        v.currentTime = 0;
      }
    });
    const current = videoRefs.current[currentIndex];
    if (current) {
      current.currentTime = 0;
      current.play().catch(() => {});
    }
  }, [currentIndex, mediaType]);

  // Image auto-advance every 3 seconds
  useEffect(() => {
    if (mediaType !== "image" || slides.length <= 1) return;
    imageTimerRef.current = setTimeout(goToNext, 3000);
    return () => clearTimeout(imageTimerRef.current);
  }, [currentIndex, mediaType, slides.length, goToNext]);

  // When a video ends: advance to next (single video uses loop attr instead)
  const handleVideoEnded = useCallback(() => {
    if (slides.length > 1) goToNext();
  }, [slides.length, goToNext]);

  const handlePrev = () => {
    clearTimeout(imageTimerRef.current);
    goToPrev();
  };
  const handleNext = () => {
    clearTimeout(imageTimerRef.current);
    goToNext();
  };

  return (
    <section className={styles.hero}>
      {/* Slide strip */}
      <div
        className={styles.heroSlider}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className={styles.heroSlide}>
            {mediaType === "image" ? (
              <Image
                src={slide.url}
                alt="The Design Factory - Personalized Gifts"
                fill
                className={styles.slideMedia}
                priority={index === 0}
              />
            ) : (
              <video
                ref={(el) => { videoRefs.current[index] = el; }}
                src={slide.url}
                autoPlay
                muted
                playsInline
                preload={index === 0 ? "auto" : "metadata"}
                loop={slides.length === 1}
                onEnded={handleVideoEnded}
                className={styles.slideMedia}
                style={{ display: "block" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Navigation arrows — hidden when there is only one slide */}
      {slides.length > 1 && (
        <>
          <button
            className={`${styles.navBtn} ${styles.prevBtn}`}
            onClick={handlePrev}
            aria-label="Previous slide"
          >
            <PrevIcon />
          </button>
          <button
            className={`${styles.navBtn} ${styles.nextBtn}`}
            onClick={handleNext}
            aria-label="Next slide"
          >
            <NextIcon />
          </button>
        </>
      )}

      <div className={styles.overlay} />

      <div className={styles.heroCta}>
        <Link href="/explore" className={styles.exploreBtn}>
          Explore Collection
        </Link>
      </div>
    </section>
  );
}
