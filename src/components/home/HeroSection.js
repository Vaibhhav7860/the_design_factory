import Link from "next/link";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.bgPattern} />
      <div className={`container ${styles.content}`}>
        <p className={`heading-decorative ${styles.preTitle}`}>Welcome to</p>
        <h1 className={`heading-primary ${styles.title}`}>The Design Factory</h1>
        <p className={`heading-decorative ${styles.subtitle}`}>Handcrafted with Love</p>
        <p className={`body-text ${styles.desc}`}>
          Complete solutions to adorn your lives in a unique way. We endeavor to enrich
          your gifting experience with premium personalized merchandise.
        </p>
        <div className={styles.actions}>
          <Link href="/category/gift-stationery" className={styles.btnPrimary}>
            Shop Now
          </Link>
          <Link href="/category/labels" className={styles.btnSecondary}>
            Explore Collections
          </Link>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>500+</span>
            <span className={styles.statLabel}>Products</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>10K+</span>
            <span className={styles.statLabel}>Happy Customers</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>100%</span>
            <span className={styles.statLabel}>Customizable</span>
          </div>
        </div>
      </div>
      <div className={styles.decorCircle1} />
      <div className={styles.decorCircle2} />
      <div className={styles.decorCircle3} />
    </section>
  );
}
