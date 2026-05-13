"use client";
import { useState, useEffect } from "react";
import { testimonials } from "@/data/testimonials";
import SectionTitle from "@/components/ui/SectionTitle";
import styles from "./Testimonials.module.css";

export default function Testimonials() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActive((p) => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <SectionTitle decorative="Voices of Joy" title="What Our Customers Say" />
        <div className={styles.slider}>
          {testimonials.map((t, i) => (
            <div key={t.id} className={`${styles.slide} ${i === active ? styles.slideActive : ""}`}>
              <div className={styles.card}>
                <svg className={styles.quote} width="40" height="40" viewBox="0 0 24 24" fill="var(--gold)"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>
                <p className={styles.text}>{t.text}</p>
                <h4 className={styles.heading}>{t.heading}</h4>
                <div className={styles.author}>
                  <div className={styles.avatar}>{t.name.charAt(0)}</div>
                  <div>
                    <p className={styles.name}>{t.name}</p>
                    <p className={styles.city}>{t.city}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.dots}>
          {testimonials.map((_, i) => (
            <button key={i} className={`${styles.dot} ${i === active ? styles.dotActive : ""}`} onClick={() => setActive(i)} aria-label={`Testimonial ${i + 1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
