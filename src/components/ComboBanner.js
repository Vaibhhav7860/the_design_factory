import Link from "next/link";
import Image from "next/image";
import styles from "./ComboBanner.module.css";

export default function ComboBanner() {
  return (
    <section className={styles.section}>
      <div className={styles.wrapper}>
        <div className={styles.textCol}>
          <h2 className={styles.heading}>
            Mix, Match &amp; <br />
            <span>Create</span> Your Combo
          </h2>
          <p className={styles.desc}>
            Why settle for one when you can have it all? Pick your favourite products,
            mix and match them into a perfect combo, and enjoy exclusive discounts.
            <b>Choose any 3 products and get 10% off — or go big with 5+ products and save 20%!</b>
          </p>
          <Link href="/make-combo" className={styles.ctaButton}>
            Create Your Combo
          </Link>
        </div>
        <div className={styles.imageCol}>
          <Image
            src="/images/make_your_combo.jpeg"
            alt="Make Your Own Combo"
            width={600}
            height={500}
            className={styles.image}
          />
        </div>
      </div>
    </section>
  );
}
