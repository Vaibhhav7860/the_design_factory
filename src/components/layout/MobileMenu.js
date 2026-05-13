"use client";
import { useState } from "react";
import Link from "next/link";
import { categories } from "@/data/categories";
import styles from "./MobileMenu.module.css";

export default function MobileMenu({ open, onClose }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <>
      <div className={`${styles.overlay} ${open ? styles.overlayOpen : ""}`} onClick={onClose} />
      <aside className={`${styles.menu} ${open ? styles.open : ""}`}>
        <div className={styles.header}>
          <span className={styles.brand}>The Design Factory</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <nav className={styles.nav}>
          {categories.map((cat) => (
            <div key={cat.id} className={styles.group}>
              <button
                className={styles.groupBtn}
                onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
              >
                <Link href={`/category/${cat.slug}`} onClick={onClose} className={styles.groupLink}>{cat.title}</Link>
                {cat.subcategories.length > 0 && (
                  <svg className={`${styles.chevron} ${expanded === cat.id ? styles.chevronOpen : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                )}
              </button>
              {expanded === cat.id && (
                <div className={styles.subs}>
                  {cat.subcategories.map((sub) => (
                    <Link key={sub.slug} href={`/category/${cat.slug}`} onClick={onClose} className={styles.subLink}>
                      {sub.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
