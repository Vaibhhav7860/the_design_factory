import Image from "next/image";
import styles from "./WhyChooseUs.module.css";



export default function WhyChooseUs() {
  return (
    <section className={styles.section}>
      <div className={styles.imageWrapper}>
        <Image
          src="/images/why_the_design.png"
          alt="Why The Design Factory Values"
          width={1200}
          height={400}
          className={styles.valuesImage}
        />
      </div>
    </section>
  );
}
