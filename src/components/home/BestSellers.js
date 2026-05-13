"use client";
import { useState } from "react";
import { getProductsByCollection } from "@/data/products";
import ProductCard from "@/components/product/ProductCard";
import SectionTitle from "@/components/ui/SectionTitle";
import Link from "next/link";
import styles from "./BestSellers.module.css";

const tabs = [
  { key: "bestsellers", label: "Best Sellers", href: "/category/labels" },
  { key: "new-arrivals", label: "New Arrivals", href: "/category/gift-stationery" },
  { key: "school-essentials", label: "School Essentials", href: "/category/school-essentials" },
];

export default function BestSellers() {
  const [active, setActive] = useState("bestsellers");
  const products = getProductsByCollection(active);

  return (
    <section className="section" style={{ background: "var(--bg-primary)" }}>
      <div className="container">
        <SectionTitle decorative="Discover" title="Explore" subtitle="Browse our most loved products across collections" />
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.tab} ${active === tab.key ? styles.tabActive : ""}`}
              onClick={() => setActive(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className={styles.grid}>
          {products.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className={styles.viewAll}>
          <Link href={tabs.find(t => t.key === active)?.href || "/"} className={styles.viewAllBtn}>
            View All →
          </Link>
        </div>
      </div>
    </section>
  );
}
