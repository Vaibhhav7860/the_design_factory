"use client";
import { useState } from "react";
import { faqs } from "@/data/testimonials";
import SectionTitle from "@/components/ui/SectionTitle";
import styles from "./FAQ.module.css";

export default function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section className="section" style={{ background: "var(--bg-neu)" }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <SectionTitle decorative="Questions?" title="Frequently Asked" />
        <div className={styles.list}>
          {faqs.map((faq) => (
            <div key={faq.id} className={`${styles.item} ${open === faq.id ? styles.itemOpen : ""}`}>
              <button className={styles.question} onClick={() => setOpen(open === faq.id ? null : faq.id)}>
                <span>{faq.question}</span>
                <svg className={styles.icon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div className={styles.answerWrap}>
                <p className={styles.answer}>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
