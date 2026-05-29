"use client";

import { useState, useRef } from "react";
import styles from "./VideoReels.module.css";
const PlayIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);
import dynamic from "next/dynamic";

// Dynamically import the VideoModal so it doesn't load until needed
const VideoModal = dynamic(() => import("../ui/VideoModal"), { ssr: false });

const reelVideos = [
  {
    src: "/videos/insta_videos/749d355c740343efb295ee601eecae41.HD-1080p-7.2Mbps-83595540.mp4",
    title: "Soccer Canvas Bag",
    price: "1,299",
    mrp: "2,399",
    discount: "46% off",
  },
  {
    src: "/videos/insta_videos/reelUp_im19u0uvcbc1726742082638_short.mp4",
    title: "Aqua Girl Wonder Backpack",
    price: "2,299",
    mrp: "2,899",
    discount: "21% off",
  },
  {
    src: "/videos/insta_videos/reelUp_jwzi9bwagyf1726741366980_short.mp4",
    title: "Croco Puzzle Bag",
    price: "1,599",
    mrp: "2,599",
    discount: "38% off",
  },
  {
    src: "/videos/insta_videos/fourth_video.mp4",
    title: "Animals Backpack",
    price: "2,099",
    mrp: "3,199",
    discount: "34% off",
  },
  {
    src: "/videos/insta_videos/fifth_video.mp4",
    title: "Mimi Mermaid Kits Set",
    price: "1,899",
    mrp: "2,999",
    discount: "36% off",
  },
  {
    src: "/videos/insta_videos/749d355c740343efb295ee601eecae41.HD-1080p-7.2Mbps-83595540.mp4",
    title: "Soccer Canvas Bag",
    price: "1,299",
    mrp: "2,399",
    discount: "46% off",
  }
];

export default function VideoReels() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const sliderRef = useRef(null);

  const openModal = (index) => {
    setActiveVideoIndex(index);
    setModalOpen(true);
  };

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const container = sliderRef.current;
      // Scroll by roughly 2 card widths
      const scrollAmount = container.clientWidth * 0.85;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <section className={styles.section}>
        <h2 className={styles.heading}>Trending</h2>

        {/* Slider wrapper with arrows — arrows visible on mobile only */}
        <div className={styles.sliderWrapper}>
          <button
            className={`${styles.sliderArrow} ${styles.sliderArrowLeft}`}
            onClick={() => scrollSlider("left")}
            aria-label="Scroll left"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div className={styles.carouselContainer} ref={sliderRef}>
            {reelVideos.map((video, index) => (
              <div 
                key={index} 
                className={styles.card}
                onClick={() => openModal(index)}
              >
                <div className={styles.videoWrapper}>
                  <video
                    src={video.src}
                    className={styles.videoPreview}
                    loop
                    muted
                    playsInline
                    autoPlay
                  />
                  <div className={styles.playIconOverlay}>
                    <PlayIcon />
                  </div>
                </div>
                <div className={styles.productInfo}>
                  <h4 className={styles.productTitle}>{video.title}</h4>
                  <div className={styles.priceBlock}>
                    <span className={styles.price}>₹ {video.price}</span>
                    <span className={styles.mrp}>₹ {video.mrp}</span>
                    <span className={styles.discount}>{video.discount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            className={`${styles.sliderArrow} ${styles.sliderArrowRight}`}
            onClick={() => scrollSlider("right")}
            aria-label="Scroll right"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </section>

      {modalOpen && (
        <VideoModal 
          videos={reelVideos} 
          initialIndex={activeVideoIndex} 
          onClose={() => setModalOpen(false)} 
        />
      )}
    </>
  );
}
