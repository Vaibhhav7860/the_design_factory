import Link from "next/link";
import Image from "next/image";
import styles from "./explore.module.css";

export const metadata = {
  title: "Explore the Collection — The Design Factory",
  description:
    "Browse the complete edit of personalised stationery, labels, bags, organisers and more.",
};

import { connectToDatabase } from "@/lib/db/mongoose";
import { Category } from "@/lib/db/models";

export default async function ExplorePage() {
  let dbCategories = [];
  try {
    await connectToDatabase();
    // Fetch top level categories from DB, excluding bulk-orders
    dbCategories = await Category.find({ slug: { $ne: 'bulk-orders' } }).sort({ title: 1 }).lean();
  } catch (error) {
    console.error("Failed to fetch explore categories", error);
  }

  // Map to the format needed by the grid
  const categories = dbCategories.map(c => ({
    label: c.title,
    href: `/category/${c.slug}`,
    image: c.image || "/images/categories/labels.png",
    tagline: c.tagline || c.description || ""
  }));

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
