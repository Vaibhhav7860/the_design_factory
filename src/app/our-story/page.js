"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";

const milestones = [
  {
    year: "2018",
    title: "The Spark of an Idea",
    desc: "What started as a hobby of creating personalized gifts for friends and family quickly became a passion project. The early days were spent experimenting with materials in a tiny home studio.",
    image: "/images/2018.jpeg"
  },
  {
    year: "2019",
    title: "The Design Factory is Born",
    desc: "We officially launched our brand, focusing on high-quality, handcrafted labels and tags. The overwhelming positive response from our first customers fueled our drive to expand.",
    image: "/images/2019.jpeg"
  },
  {
    year: "2021",
    title: "Expanding Horizons",
    desc: "As demand grew, so did our team and our product line. We introduced complete school essential kits, beautiful combos, and invested in premium printing technology.",
    image: "/images/2021.jpeg"
  },
  {
    year: "2023",
    title: "A Global Reach",
    desc: "From a local passion project to shipping indiawide and internationally. We scaled our operations while keeping the artisan touch that makes every single product feel special.",
    image: "/images/2023.jpeg"
  },
  {
    year: "Today",
    title: "Adorning Lives",
    desc: "Today, The Design Factory is a premier destination for personalized gifting. We continue to innovate, crafting memories and bringing smiles to faces every single day.",
    image: "/images/today1.jpeg"
  }
];

export default function OurStoryPage() {
  const [visibleItems, setVisibleItems] = useState([]);
  const timelineRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => {
              if (!prev.includes(entry.target.dataset.index)) {
                return [...prev, entry.target.dataset.index];
              }
              return prev;
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    const items = document.querySelectorAll(`.${styles.timelineItem}`);
    items.forEach((item) => observer.observe(item));

    return () => items.forEach((item) => observer.unobserve(item));
  }, []);

  return (
    <main className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.heroLabel}>THE JOURNEY OF</p>
          <h1 className={styles.heroTitle}>The Design Factory</h1>
          <p className={styles.heroSubtitle}>
            Born out of passion for aesthetic and heartfelt personalization,
            we craft unique gifts that leave a lasting impression.
          </p>
        </div>
      </section>

      {/* Founder Section */}
      <section className={styles.founderSection}>
        <div className={styles.founderContainer}>
          <div className={styles.founderImageWrapper}>
            <Image 
              src="/images/DOS.jpeg" 
              alt="Founder of The Design Factory" 
              width={600} 
              height={800} 
              className={styles.founderImage}
              priority
            />
            <div className={styles.imageAccent}></div>
          </div>
          <div className={styles.founderText}>
            <h2 className={styles.sectionTitle}>Meet The Founder</h2>
            <h3 className={styles.founderName}>Radhika Lalchandani</h3>
            <p className={styles.founderRole}>Lead Designer & Creator</p>
            
            <div className={styles.quoteWrapper}>
              <span className={styles.quoteMark}>&ldquo;</span>
              <p className={styles.founderQuote}>
                Hi, I’m Radhika — the heart behind The Design Factory. What started as a passion for thoughtful gifting and beautiful stationery slowly turned into a brand loved by thousands of families, kids & gifting enthusiasts.
              </p>
            </div>

            <div className={styles.founderBio}>
              <p>
                From personalised school essentials to unique gifts and curated hampers, 
                I love turning everyday products into something meaningful and memorable.
              </p>
              <p>
                I believe details matter, creativity has no limits, and the best gifts are the ones made specially for you.
                Every order at The Design Factory is designed with love, packed with care, and created to bring smiles.
              </p>
            </div>
            

          </div>
        </div>
      </section>

      {/* Interactive Timeline */}
      <section className={styles.timelineSection}>
        <h2 className={`${styles.sectionTitle} ${styles.centerTitle}`}>Our Milestones</h2>
        <p className={styles.timelineSubtitle}>The story of how we grew, step by beautiful step.</p>
        
        <div className={styles.timelineContainer} ref={timelineRef}>
          <div className={styles.timelineLine}></div>
          
          {milestones.map((item, index) => {
            const isVisible = visibleItems.includes(String(index));
            const isEven = index % 2 === 0;
            
            return (
              <div 
                key={index} 
                className={`${styles.timelineItem} ${isEven ? styles.left : styles.right} ${isVisible ? styles.visible : ''}`}
                data-index={String(index)}
              >
                <div className={styles.timelineDot}></div>
                
                {/* Text Content */}
                <div className={styles.timelineContent}>
                  <div className={styles.timelineYear}>{item.year}</div>
                  <h3 className={styles.timelineCardTitle}>{item.title}</h3>
                  <p className={styles.timelineCardDesc}>{item.desc}</p>
                </div>

                {/* Image Card */}
                <div className={styles.timelineImageCard}>
                  <div className={styles.imageCardBorder}>
                    <Image 
                      src={item.image} 
                      alt={item.title}
                      width={300}
                      height={400}
                      className={styles.timelineImage}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action */}
      <section className={styles.enquiry}>
        <div className={styles.ctaInner}>
          <h2 className={styles.sectionTitle}>Be Part of Our Story</h2>
          <p className={styles.ctaSubtitle}>
            Explore our collections and find the perfect personalized gift for your next special occasion.
          </p>
          <a href="/explore" className={styles.shopCta}>Explore Collections</a>
        </div>
      </section>
    </main>
  );
}
