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
        heading: "Everyday Labels",
        links: [
          { label: "Rectangular Labels", href: "/category/labels?subcategory=rectangular-labels" },
          { label: "Round Labels", href: "/category/labels?subcategory=round-labels" },
          { label: "Mixed Shape Labels", href: "/category/labels?subcategory=mixed-shape-labels" },
          { label: "Transparent Labels", href: "/category/labels?subcategory=transparent-labels" },
        ],
      },
      {
        heading: "Specialty Labels",
        links: [
          { label: "3D Embossed Stickers", href: "/category/labels?subcategory=3d-embossed-stickers" },
          { label: "School Book Labels", href: "/category/labels?subcategory=school-book-labels" },
          { label: "Iron On Labels For Clothes", href: "/category/labels?subcategory=iron-on-labels" },
        ],
      }
    ],
    megaImage: "/images/categories/labels.png",
  },
  {
    label: "School Essentials",
    href: "/category/school-essentials",
    megaMenu: [
      {
        heading: "Labels",
        links: [
          { label: "Name Labels", href: "/category/school-essentials?subcategory=name-labels" },
          { label: "Iron On Labels For Clothes", href: "/category/school-essentials?subcategory=iron-on-labels-clothes" },
          { label: "Permenant Waterproof Stickers", href: "/category/school-essentials?subcategory=permanent-waterproof-stickers" },
          { label: "School Book Labels", href: "/category/school-essentials?subcategory=school-book-labels" }
        ],
      },
      {
        heading: "School Supplies",
        links: [
          { label: "Bag Tags", href: "/category/school-essentials?subcategory=bag-tags" },
          { label: "Back to School Label Set", href: "/category/school-essentials?subcategory=back-to-school-label-set" },
          { label: "Sipper Bottle", href: "/category/school-essentials?subcategory=sipper-bottle" },
          { label: "Lunch Box", href: "/category/school-essentials?subcategory=lunch-box" },
        ],
      },
      {
        heading: "More Essentials",
        links: [
          { label: "Sketch Book", href: "/category/school-essentials?subcategory=sketch-book" },
          { label: "Rewritable Planners", href: "/category/school-essentials?subcategory=rewritable-planners" },
          { label: "Pencil Case", href: "/category/school-essentials?subcategory=pencil-case" },
          { label: "School Bag & Combos", href: "/category/school-essentials?subcategory=school-bag-combos" },
        ],
      }
    ],
    megaImage: "/images/categories/school.png",
  },
  {
    label: "Gift Stationery",
    href: "/category/gift-stationery",
    megaMenu: [
      {
        heading: "Gift Tags",
        links: [
          { label: "3D Gift Tags", href: "/category/gift-stationery?subcategory=3d-gift-tags" },
          { label: "Flat Gift Tags", href: "/category/gift-stationery?subcategory=flat-gift-tags" },
          { label: "Hanging Gift Tags", href: "/category/gift-stationery?subcategory=hanging-gift-tags" },
        ],
      },
      {
        heading: "More Stationery",
        links: [
          { label: "Gift Stickers", href: "/category/gift-stationery?subcategory=gift-stickers" },
          { label: "Money Envelopes", href: "/category/gift-stationery?subcategory=money-envelopes" },
          { label: "Gift Stationery Combo", href: "/category/gift-stationery?subcategory=gift-stationery-sets" },
        ],
      },
    ],
    megaImage: "/images/categories/stationery.png",
  },
  {
    label: "Adults Corner",
    href: "/category/adults-corner",
    megaMenu: [
      {
        heading: "Tags & Envelopes",
        links: [
          { label: "Flat Gift Tags", href: "/category/adults-corner?subcategory=flat-gift-tags-adults" },
          { label: "3D Gift Tags", href: "/category/adults-corner?subcategory=3d-gift-tags-adults" },
          { label: "Money Envelopes", href: "/category/adults-corner?subcategory=money-envelopes-adults" },
        ],
      },
      {
        heading: "Accessories & Combos",
        links: [
          { label: "Bag Tags", href: "/category/adults-corner?subcategory=bag-tags-adults" },
          { label: "Towels", href: "/category/adults-corner?subcategory=towels-adults" },
          { label: "Gift Stationery Combo", href: "/category/adults-corner?subcategory=gift-stationery-combo-adults" },
        ],
      },
    ],
    megaImage: "/images/categories/adults-corner.png",
  },
  {
    label: "Bags",
    href: "/category/bags",
    megaMenu: [
      {
        heading: "",
        links: [
          { label: "Duffle Bags", href: "/category/bags?subcategory=duffle-bags" },
          { label: "Jelly Bags", href: "/category/bags?subcategory=jelly-bags" },
          { label: "Art Bags", href: "/category/bags?subcategory=art-bags" },
          { label: "Backpacks", href: "/category/bags?subcategory=backpacks" },
          { label: "Tote Bags", href: "/category/bags?subcategory=tote-bags" },
        ],
      },
      {
        heading: "",
        links: [
          { label: "Swimming Bags", href: "/category/bags?subcategory=swimming-bags" },
          { label: "School Bags", href: "/category/bags?subcategory=school-bags" },
          { label: "Denim Bags", href: "/category/bags?subcategory=denim-bags" },
          { label: "Baby Diaper Bag", href: "/category/bags?subcategory=baby-diaper-bag" },
        ],
      }
    ],
    megaImage: "/images/categories/bags.png",
  },
  {
    label: "Organisers",
    href: "/category/organisers",
    megaMenu: [
      {
        heading: "",
        links: [
          { label: "Utility Pouches", href: "/category/organisers?subcategory=utility-pouches" },
          { label: "Storage Basket", href: "/category/organisers?subcategory=storage-basket" },
        ],
      },
      {
        heading: "",
        links: [
          { label: "Vanity", href: "/category/organisers?subcategory=vanity" },
          { label: "Organiser Sets", href: "/category/organisers?subcategory=organiser-sets" },
        ],
      }
    ],
    megaImage: "/images/categories/organisers.png",
  },
  {
    label: "Kids Accessories",
    href: "/category/kids-accessories",
    megaMenu: [
      {
        heading: "",
        links: [
          { label: "Wall Clock", href: "/category/kids-accessories?subcategory=wall-clock" },
          { label: "Table Mat", href: "/category/kids-accessories?subcategory=table-mat" },
          { label: "Towel", href: "/category/kids-accessories?subcategory=towel" },
          { label: "Table Organiser", href: "/category/kids-accessories?subcategory=table-organiser" },
        ],
      },
      {
        heading: "",
        links: [
          { label: "Cap", href: "/category/kids-accessories?subcategory=cap" },
          { label: "Apron Set", href: "/category/kids-accessories?subcategory=apron-set" },
          { label: "Neck Pillow Combo", href: "/category/kids-accessories?subcategory=neck-pillow-combo" },
        ],
      }
    ],
    megaImage: "/images/categories/kids-accessories.png",
  },
  {
    label: "Combos",
    href: "/category/combos",
    megaMenu: [
      {
        heading: "",
        links: [
          { label: "Back To School Label Set", href: "/category/combos?subcategory=back-to-school-label-set" },
          { label: "Gift Stationery Combo - Kids", href: "/category/combos?subcategory=gift-stationery-combo-kids" },
          { label: "Gift Stationery Combo - Adults", href: "/category/combos?subcategory=gift-stationery-combo-adults" },
        ],
      },
      {
        heading: "",
        links: [
          { label: "Bag Combo Set", href: "/category/combos?subcategory=bag-combo-set" },
          { label: "School Bag Combo", href: "/category/combos?subcategory=school-bag-combo" },
          { label: "Organiser Sets", href: "/category/combos?subcategory=organiser-sets" },
        ],
      }
    ],
    megaImage: "/images/categories/combos.png",
  },
  {
    label: "Shop By Theme",
    href: "/category/themes",
    megaMenu: [
      {
        heading: "",
        links: [
          { label: "Animals", href: "/category/themes?subcategory=animals" },
          { label: "Cute Lil Boy", href: "/category/themes?subcategory=cute-lil-boy" },
          { label: "Cute Lil Girl", href: "/category/themes?subcategory=cute-lil-girl" },
          { label: "Dino", href: "/category/themes?subcategory=dino" },
          { label: "Favourite Characters", href: "/category/themes?subcategory=favourite-characters" },
          { label: "Princess", href: "/category/themes?subcategory=princess" },
        ],
      },
      {
        heading: "",
        links: [
          { label: "Space", href: "/category/themes?subcategory=space" },
          { label: "Superheroes", href: "/category/themes?subcategory=superheroes" },
          { label: "Transport", href: "/category/themes?subcategory=transport" },
          { label: "Unicorn", href: "/category/themes?subcategory=unicorn" },
          { label: "Underwater", href: "/category/themes?subcategory=underwater" },
        ],
      }
    ],
    megaImage: "/images/categories/themes.png",
  },
  { label: "Bulk Orders", href: "/bulk-orders" }
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
              height={90}
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
                              {link.subLinks ? (
                                <details className={styles.navDetails} open={link.defaultOpen}>
                                  <summary className={styles.navSummary}>
                                    {link.label}
                                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                  </summary>
                                  <ul className={styles.nestedLinks}>
                                    {link.subLinks.map((sub, si) => (
                                      <li key={si}>
                                        <Link href={sub.href}>{sub.label}</Link>
                                      </li>
                                    ))}
                                  </ul>
                                </details>
                              ) : (
                                <Link href={link.href}>{link.label}</Link>
                              )}
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
