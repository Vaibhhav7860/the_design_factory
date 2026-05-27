import Link from "next/link";
import Image from "next/image";
import styles from "./AboutSection.module.css";

export default function AboutSection() {
  return (
    <section className={styles.section}>
      <div className={styles.wrapper}>
        <div className={styles.imageCol}>
          <Image
            src="/images/radhika_mam1.jpeg"
            alt="About The Design Factory"
            width={600}
            height={500}
            className={styles.image}
          />
          <div className={styles.imageShadow} />
        </div>
        <div className={styles.textCol}>
          <h2 className={styles.heading}>
            One-of-a-Kind Gifts <br />
            <span>Handcrafted</span> for You
          </h2>
          <p className={styles.desc}>
            The Design Factory provides complete solutions to adorn your lives in a unique way.
            We endeavor to enrich your gifting experience with international-quality standards.
            Every piece is curated with extreme attention to detail, ensuring that your personalized
            gifts leave a lasting impression.
          </p>
          <Link href="/our-story" className={styles.ctaButton}>
            Discover Our Story
          </Link>
        </div>
      </div>
    </section>
  );
}
