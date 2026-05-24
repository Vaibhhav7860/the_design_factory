"use client";

import { useState } from "react";
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

  const openModal = (index) => {
    setActiveVideoIndex(index);
    setModalOpen(true);
  };

  return (
    <>
      <section className={styles.section}>
        <h2 className={styles.heading}>Trending</h2>
        <div className={styles.carouselContainer}>
          {reelVideos.map((video, index) => (
            <div 
              key={index} 
              className={styles.card}
              onClick={() => openModal(index)}
              style={{ 
                '--card-border-color': ['#FCD589', '#FBC9BC', '#d7e4e4'][index % 3],
                border: '6px solid var(--card-border-color)'
              }}
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
