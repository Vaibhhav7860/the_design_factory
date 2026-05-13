import Link from "next/link";
import { blogPosts } from "@/data/testimonials";
import SectionTitle from "@/components/ui/SectionTitle";
import ScrollReveal from "@/components/ui/ScrollReveal";
import styles from "./BlogPreview.module.css";

export default function BlogPreview() {
  return (
    <section className="section">
      <div className="container">
        <SectionTitle decorative="Stories" title="From Our Blog" subtitle="Inspiration, tips, and ideas for personalized gifting" />
        <div className={styles.grid}>
          {blogPosts.map((post, i) => (
            <ScrollReveal key={post.id} delay={i * 0.15}>
              <article className={styles.card}>
                <div className={styles.imageBg} style={{ background: i === 0 ? `linear-gradient(135deg, var(--salmon-light), var(--bg-neu))` : i === 1 ? `linear-gradient(135deg, var(--gold-light), var(--bg-neu))` : `linear-gradient(135deg, var(--cyan-light), var(--bg-neu))` }}>
                  <span className={styles.imageIcon}>✦</span>
                </div>
                <div className={styles.body}>
                  <h3 className={styles.title}>{post.title}</h3>
                  <p className={styles.excerpt}>{post.excerpt}</p>
                  <span className={styles.readMore}>Read More →</span>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
