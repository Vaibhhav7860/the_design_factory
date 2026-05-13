"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { categories } from "@/data/categories";
import CartDrawer from "./CartDrawer";
import MobileMenu from "./MobileMenu";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { cartCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navCategories = categories.slice(0, 8);

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
        <div className={`container ${styles.inner}`}>
          {/* Hamburger */}
          <button className={styles.hamburger} onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <span /><span /><span />
          </button>

          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <span className={styles.logoMain}>The Design Factory</span>
            <span className={styles.logoSub}>Handcrafted with Love</span>
          </Link>

          {/* Desktop Nav */}
          <ul className={styles.links}>
            {navCategories.map((cat) => (
              <li
                key={cat.id}
                className={styles.linkItem}
                onMouseEnter={() => setActiveMenu(cat.id)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <Link href={`/category/${cat.slug}`} className={styles.link}>
                  {cat.title}
                </Link>
                {cat.subcategories.length > 0 && activeMenu === cat.id && (
                  <div className={styles.mega}>
                    <div className={styles.megaInner}>
                      {cat.subcategories.map((sub) => (
                        <Link key={sub.slug} href={`/category/${cat.slug}`} className={styles.megaLink}>
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className={styles.actions}>
            <button className={styles.cartBtn} onClick={() => setCartOpen(true)} aria-label="Open cart">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </button>
          </div>
        </div>
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
