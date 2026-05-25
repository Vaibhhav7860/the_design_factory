import Link from "next/link";
import Image from "next/image";
import styles from "./explore.module.css";

export const metadata = {
  title: "Explore the Collection — The Design Factory",
  description:
    "Browse the complete edit of personalised stationery, labels, bags, organisers and more.",
};

const categories = [
  {
    label: "Labels",
    href: "/category/labels",
    image: "/images/categories/labels.png",
    tagline: "Mark every belonging with intention",
  },
  {
    label: "School Essentials",
    href: "/category/school-essentials",
    image: "/images/categories/school.png",
    tagline: "From book labels to lunch boxes",
  },
  {
    label: "Gift Stationery",
    href: "/category/gift-stationery",
    image: "/images/categories/stationery.png",
    tagline: "Hand-finished gifting paper edits",
  },
  {
    label: "Adults Corner",
    href: "/category/adults-corner",
    image: "/images/categories/adults-corner.png",
    tagline: "Considered pieces for the grown-ups",
  },
  {
    label: "Bags",
    href: "/category/bags",
    image: "/images/categories/bags.png",
    tagline: "Carry your story, beautifully",
  },
  {
    label: "Organisers",
    href: "/category/organisers",
    image: "/images/categories/organisers.png",
    tagline: "Order, made to feel personal",
  },
  {
    label: "Kids Accessories",
    href: "/category/kids-accessories",
    image: "/images/categories/kids-accessories.png",
    tagline: "Small details, made memorable",
  },
  {
    label: "Combos",
    href: "/category/combos",
    image: "/images/categories/combos.png",
    tagline: "Curated sets that travel together",
  },
  {
    label: "Shop By Theme",
    href: "/category/themes",
    image: "/images/categories/themes.png",
    tagline: "From unicorns to underwater life",
  },
];

export default function ExplorePage() {
  return (
    <main className={styles.page}>
      {/* ── Hero Header ── */}
      <header className={styles.header}>
        <h1 className={styles.title}>
          Explore <em>the</em> Collection
        </h1>
        <p className={styles.subtitle}>
          A complete index of everything we make. Each category leads to the
          full range, considered, personalised, and made by hand.
        </p>
        <div className={styles.headerRule} />
      </header>

      {/* ── Category Grid ── */}
      <section className={styles.gridSection}>
        <div className={styles.grid}>
          {categories.map((cat, i) => {
            const HOVER_COLORS = ["#FCD589", "#FBC9BC", "#d7e4e4"];
            const hoverColor = HOVER_COLORS[i % HOVER_COLORS.length];
            return (
              <Link
                key={cat.href}
                href={cat.href}
                className={styles.card}
                style={{
                  "--reveal-delay": `${i * 60}ms`,
                  "--hover-color": hoverColor,
                }}
              >
              {/* Outer shell */}
              <div className={styles.cardShell}>
                {/* Inner core with image */}
                <div className={styles.cardCore}>
                  <div className={styles.imageWrap}>
                    <Image
                      src={cat.image}
                      alt={cat.label}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className={styles.image}
                    />
                  </div>

                  {/* Number marker */}
                  <span className={styles.cardIndex}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              </div>

              {/* Caption */}
              <div className={styles.caption}>
                <div className={styles.captionTextCol}>
                  <h2 className={styles.cardTitle}>{cat.label}</h2>
                  <p className={styles.cardTagline}>{cat.tagline}</p>
                </div>
                <span className={styles.cardArrow} aria-hidden="true">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="8 7 17 7 17 16" />
                  </svg>
                </span>
              </div>
            </Link>
            );
          })}
        </div>
      </section>

      {/* ── Footer Mark ── */}
      <footer className={styles.footerMark}>
        <span>Personalised · Hand-finished · Made with care</span>
      </footer>
    </main>
  );
}
