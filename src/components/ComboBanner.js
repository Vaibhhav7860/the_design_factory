import Link from "next/link";
import Image from "next/image";
import styles from "./ComboBanner.module.css";

export default function ComboBanner() {
  return (
    <section className={styles.banner}>
      <div className={styles.bannerContainer}>
        {/* Left - Image */}
        <div className={styles.imageSection}>
          <div className={styles.imageWrapper}>
            <Image
              src="/images/bulk_order_banner.png"
              alt="Make Your Own Combo"
              width={600}
              height={400}
              className={styles.bannerImage}
            />
          </div>
        </div>

        {/* Right - Text & Button */}
        <div className={styles.textSection}>
          <h2 className={styles.title}>Make Your Own Combo</h2>
          <p className={styles.description}>
            Choose any 3 products and get 10% off • Choose 5+ products and get 20% off
          </p>
          <Link href="/make-combo" className={styles.ctaButton}>
            Create Your Combo
          </Link>
        </div>
      </div>
    </section>
  );
}
