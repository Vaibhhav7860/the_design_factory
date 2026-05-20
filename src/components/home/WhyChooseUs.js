import Image from "next/image";
import styles from "./WhyChooseUs.module.css";



export default function WhyChooseUs() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <Image
          src="/images/butterfly.png"
          alt="The Design Factory Logo"
          width={270}
          height={100}
          className={styles.logo}
        />
        <h2 className={styles.heading}>WHY THE DESIGN FACTORY?</h2>
        <p className={styles.desc}>
          We are a design-led brand offering personalized stationery, invitations &amp; creative direction for heartfelt expressions.
        </p>
      </div>
      <div className={styles.imageWrapper}>
        <Image
          src="/images/why_the_design_factory.png"
          alt="Why The Design Factory Values"
          width={1200}
          height={400}
          className={styles.valuesImage}
        />
      </div>
    </section>
  );
}
