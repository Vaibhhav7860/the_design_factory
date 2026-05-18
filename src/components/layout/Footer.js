"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

export default function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        {/* About */}
        <div className={styles.col}>
          <h4>ABOUT US</h4>
          <p>
            Everything begins with a feeling. At The Design Factory, we create heartfelt,
            personalized designs finished with deep attention to detail. Every piece carries
            a sense of purpose and craftsmanship.
          </p>
          <div className={styles.socialIcons}>
            {/* Instagram */}
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#ig-gradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f09433" />
                    <stop offset="25%" stopColor="#e6683c" />
                    <stop offset="50%" stopColor="#dc2743" />
                    <stop offset="75%" stopColor="#cc2366" />
                    <stop offset="100%" stopColor="#bc1888" />
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            {/* Facebook */}
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1877F2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Support */}
        <div className={styles.col}>
          <h4>SUPPORT</h4>
          <Link href="#">Contact Us</Link>
          <Link href="#">FAQs</Link>
          <Link href="#">Track Order</Link>
          <Link href="#">Blogs</Link>
        </div>

        {/* Policies */}
        <div className={styles.col}>
          <h4>POLICIES</h4>
          <Link href="#">Return & Exchange</Link>
          <Link href="#">Privacy Policy</Link>
          <Link href="#">Terms & Conditions</Link>
          <Link href="#">Shipping Policy</Link>
        </div>

        {/* Newsletter */}
        <div className={styles.col}>
          <h4>NEWSLETTER</h4>
          <p className={styles.newsletterDesc}>
            Stay updated with our new collections and exclusive offers.
          </p>
          <div className={styles.newsletterInput}>
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button aria-label="Subscribe">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
          <div className={styles.copyrightText}>
            &copy; {new Date().getFullYear()}, The Design Factory.
          </div>
        </div>
      </div>

      {/* Footer Characters */}
      <div className={styles.characterArea}>
        <div className={styles.characterProcession}>
          <Image src="/images/footer-char-1.png" alt="Character 1" width={280} height={280} className={`${styles.footerChar} ${styles.footerCharLarge}`} />
          <div className={styles.centerGroup}>
            <div className={styles.tribute}>
              <span className={styles.cappuccino}>CAPPUCCINO</span> - Our Heart. Our Joy. Our Inspiration.
            </div>
            <Image src="/images/footer-char-2.png" alt="Character 2" width={400} height={400} className={`${styles.footerChar} ${styles.footerCharCenter}`} />
          </div>
          <Image src="/images/footer-char-3.png" alt="Character 3" width={280} height={280} className={`${styles.footerChar} ${styles.footerCharLarge}`} />
        </div>
      </div>

      {/* Decorative Pattern */}
      <div className={styles.bottomPattern} />
    </footer>
  );
}
