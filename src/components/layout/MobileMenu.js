"use client";
import { useState } from "react";
import Link from "next/link";
import styles from "./MobileMenu.module.css";

export default function MobileMenu({ open, onClose, navItems = [] }) {
  const [expandedItem, setExpandedItem] = useState(null);

  if (!open) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.drawer}>
        <div className={styles.header}>
          <span className={styles.title}>Menu</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item, index) => (
            <div key={index} className={styles.navGroup}>
              <div className={styles.navItemRow}>
                <Link
                  href={item.href}
                  className={styles.navLink}
                  onClick={onClose}
                >
                  {item.label}
                </Link>
                {item.megaMenu && (
                  <button
                    className={styles.expandBtn}
                    onClick={() => setExpandedItem(expandedItem === index ? null : index)}
                    aria-label={`Expand ${item.label}`}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{
                        transform: expandedItem === index ? "rotate(180deg)" : "rotate(0)",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                )}
              </div>
              {item.megaMenu && expandedItem === index && (
                <div className={styles.subMenu}>
                  {item.megaMenu.map((col, ci) => (
                    <div key={ci} className={styles.subGroup}>
                      <span className={styles.subHeading}>{col.heading}</span>
                      {col.links.map((link, li) => (
                        <Link
                          key={li}
                          href={link.href}
                          className={styles.subLink}
                          onClick={onClose}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
