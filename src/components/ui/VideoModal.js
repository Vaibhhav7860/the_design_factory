"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./VideoModal.module.css";
const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const VolumeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>;
const MuteIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>;
const ShareIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>;
const PrevIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const NextIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;

export default function VideoModal({ videos, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(false);
  const videoRefs = useRef([]);

  // Setup keyboard navigation and escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, onClose]);

  // Handle play/pause based on active index
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentIndex) {
          video.currentTime = 0;
          video.play().catch(e => console.log("Autoplay prevented:", e));
        } else {
          video.pause();
        }
      }
    });
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "The Design Factory - Reel",
        url: window.location.href,
      });
    } catch (err) {
      console.log("Error sharing:", err);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const getClassNameForIndex = (index) => {
    if (index === currentIndex) return styles.active;
    const prevIndex = (currentIndex - 1 + videos.length) % videos.length;
    const nextIndex = (currentIndex + 1) % videos.length;
    
    if (index === prevIndex) return styles.prev;
    if (index === nextIndex) return styles.next;
    
    return styles.hidden;
  };

  const handleVideoClick = (index) => {
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
        <CloseIcon />
      </button>

      <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={(e) => { e.stopPropagation(); handlePrev(); }} aria-label="Previous video">
        <PrevIcon />
      </button>

      <div className={styles.carousel} onClick={(e) => e.stopPropagation()}>
        {videos.map((video, index) => (
          <div 
            key={index} 
            className={`${styles.videoWrapper} ${getClassNameForIndex(index)}`}
            onClick={() => handleVideoClick(index)}
          >
            {index === currentIndex && (
              <div className={styles.videoTopControls}>
                <button 
                  className={styles.videoControlBtn} 
                  onClick={(e) => { e.stopPropagation(); handleShare(); }} 
                  aria-label="Share"
                >
                  <ShareIcon />
                </button>
                <button 
                  className={styles.videoControlBtn} 
                  onClick={(e) => { e.stopPropagation(); toggleMute(); }} 
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <MuteIcon /> : <VolumeIcon />}
                </button>
              </div>
            )}
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              src={video.src}
              className={styles.videoElement}
              loop
              playsInline
              muted={isMuted}
            />
          </div>
        ))}
      </div>

      <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={(e) => { e.stopPropagation(); handleNext(); }} aria-label="Next video">
        <NextIcon />
      </button>
    </div>
  );
}
