"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";
import MobileMenu from "./MobileMenu";
import styles from "./Navbar.module.css";

const navItems = [
  {
    label: "Labels",
    href: "/category/labels",
    megaMenu: [
      {
        heading: "Popular Shapes",
        links: [
          { label: "Rectangular Labels", href: "/category/labels" },
          { label: "Round Labels", href: "/category/labels" },
          { label: "Mixed Shape Labels", href: "/category/labels" },
          { label: "Transparent Labels", href: "/category/labels" },
        ],
      },
      {
        heading: "Specialty",
        links: [
          { label: "3D Embossed Stickers", href: "/category/labels" },
          { label: "Iron On Labels", href: "/category/labels" },
          { label: "School Book Labels", href: "/category/labels" },
        ],
      },
      {
        heading: "Shop by Theme",
        links: [
          { label: "Cute Lil Boy", href: "/category/themes" },
          { label: "Cute Lil Girl", href: "/category/themes" },
          { label: "Animals & Dino", href: "/category/themes" },
        ],
      },
    ],
    megaImage: "/images/categories/labels.png",
  },
  {
    label: "School Essentials",
    href: "/category/school-essentials",
    megaMenu: [
      {
        heading: "Essentials",
        links: [
          { label: "Back to School Set", href: "/category/school-essentials" },
          { label: "Name Labels", href: "/category/school-essentials" },
          { label: "Bag Tags", href: "/category/school-essentials" },
        ],
      },
      {
        heading: "Gear",
        links: [
          { label: "Sipper Bottles", href: "/category/school-essentials" },
          { label: "Pencil Cases", href: "/category/school-essentials" },
          { label: "Sketch Books", href: "/category/school-essentials" },
        ],
      },
      {
        heading: "Combos",
        links: [
          { label: "Mega Gift Combo", href: "/category/combos" },
          { label: "School Backpacks", href: "/category/bags" },
        ],
      },
    ],
    megaImage: "/images/categories/school.png",
  },
  {
    label: "Stationery",
    href: "/category/gift-stationery",
    megaMenu: [
      {
        heading: "Gift Tags",
        links: [
          { label: "3D Gift Tags", href: "/category/gift-stationery" },
          { label: "Flat Gift Tags", href: "/category/gift-stationery" },
          { label: "Hanging Tags", href: "/category/gift-stationery" },
        ],
      },
      {
        heading: "Envelopes",
        links: [
          { label: "Money Envelopes", href: "/category/gift-stationery" },
          { label: "Gift Stickers", href: "/category/gift-stationery" },
        ],
      },
      {
        heading: "Sets",
        links: [
          { label: "Gift Stationery Sets", href: "/category/gift-stationery" },
        ],
      },
    ],
    megaImage: "/images/categories/stationery.png",
  },
  {
    label: "Bags",
    href: "/category/bags",
    megaMenu: [
      {
        heading: "Kid's Bags",
        links: [
          { label: "Backpacks", href: "/category/bags" },
          { label: "Waist Bags", href: "/category/bags" },
          { label: "Crossbody Bags", href: "/category/bags" },
        ],
      },
      {
        heading: "Women's Totes",
        links: [
          { label: "Canvas Totes", href: "/category/bags" },
          { label: "Jute Bags", href: "/category/bags" },
          { label: "Vanity Pouches", href: "/category/bags" },
        ],
      },
      {
        heading: "Style Guide",
        links: [
          { label: "Floral Prints", href: "/category/bags" },
        ],
      },
    ],
    megaImage: "/images/categories/bags.png",
  },
  {
    label: "Combos",
    href: "/category/combos",
    megaMenu: [
      {
        heading: "Gift Sets",
        links: [
          { label: "Birthday Combos", href: "/category/combos" },
          { label: "Baby Shower Sets", href: "/category/combos" },
          { label: "Sibling Sets", href: "/category/combos" },
        ],
      },
      {
        heading: "School Kits",
        links: [
          { label: "New Session Combo", href: "/category/combos" },
          { label: "Lunch & Sipper Duo", href: "/category/combos" },
        ],
      },
      {
        heading: "Corporate",
        links: [
          { label: "Executive Bundles", href: "/category/combos" },
          { label: "Welcome Kits", href: "/category/combos" },
        ],
      },
    ],
    megaImage: "/images/categories/labels.png",
  },
  { label: "Collection by Theme", href: "/category/themes" },
  { label: "Accessories & Gifts", href: "/category/accessories-gifts" },
  { label: "Adults Corner", href: "/category/adults-corner" },
];

export default function Navbar() {
  const { cartCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`} id="header">
        {/* Announcement Bar */}
        <div className={styles.announcementBar}>
          <div className={styles.announcementTrack}>
            {[...Array(4)].map((_, i) => (
              <span key={i} className={styles.announcementText}>
                PERSONALIZED WITH LOVE &bull; WORLDWIDE SHIPPING &bull; UNIQUE GIFTING SOLUTIONS &bull;&nbsp;
              </span>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
          {/* Hamburger - Mobile */}
          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <span /><span /><span />
          </button>

          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <Image
              src="/images/the_design_factory_logo.png"
              alt="The Design Factory"
              width={220}
              height={73}
              className={styles.logoImg}
              priority
            />
          </Link>

          {/* Desktop Nav Links */}
          <ul className={styles.navLinks}>
            {navItems.map((item, index) => (
              <li
                key={index}
                className={styles.navItem}
                onMouseEnter={() => item.megaMenu && setActiveMenu(index)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <Link href={item.href} className={styles.navLink}>
                  {item.label}
                </Link>
                {item.megaMenu && activeMenu === index && (
                  <div className={styles.megaMenu}>
                    {item.megaMenu.map((col, ci) => (
                      <div key={ci} className={styles.megaCol}>
                        <h4>{col.heading}</h4>
                        <ul>
                          {col.links.map((link, li) => (
                            <li key={li}>
                              <Link href={link.href}>{link.label}</Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {item.megaImage && (
                      <div className={styles.megaCol}>
                        <Image
                          src={item.megaImage}
                          alt={item.label}
                          width={300}
                          height={300}
                          className={styles.megaImage}
                        />
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Nav Icons */}
          <div className={styles.navIcons}>
            {/* Search */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {/* Account */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            {/* Cart */}
            <button
              className={styles.cartBtn}
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className={styles.cartBadge}>{cartCount}</span>
              )}
            </button>
          </div>
        </nav>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} navItems={navItems} />
    </>
  );
}
