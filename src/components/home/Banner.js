import Image from "next/image";
import styles from "./Banner.module.css";

export default function Banner() {
  return (
    <section className={styles.section}>
      <div className={styles.imageWrapper}>
        <Image
          src="/images/banner.png"
          alt="Promotional Banner"
          width={1920}
          height={600}
          className={styles.image}
        />
      </div>
    </section>
  );
}
