import Link from "next/link";
import { getFeaturedCategories } from "@/data/categories";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SectionTitle from "@/components/ui/SectionTitle";
import styles from "./CategoryShowcase.module.css";

export default function CategoryShowcase() {
  const cats = getFeaturedCategories();
  return (
    <section className="section">
      <div className="container">
        <SectionTitle decorative="Explore" title="Our Collections" subtitle="Discover our curated range of personalized products" />
        <div className={styles.grid}>
          {cats.map((cat, i) => (
            <ScrollReveal key={cat.id} delay={i * 0.1}>
              <Link href={`/category/${cat.slug}`} className={styles.card}>
                <div className={styles.cardBg} style={{ background: i % 3 === 0 ? `linear-gradient(135deg, var(--gold-light), var(--bg-neu))` : i % 3 === 1 ? `linear-gradient(135deg, var(--salmon-light), var(--bg-neu))` : `linear-gradient(135deg, var(--cyan-light), var(--bg-neu))` }} />
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{cat.title}</h3>
                  <p className={styles.cardDesc}>{cat.description}</p>
                  <span className={styles.cardLink}>Explore →</span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
