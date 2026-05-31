import styles from "@/app/(storefront)/account/account.module.css";

export default function BrandPanel({ topline, hero, sub }) {
  return (
    <aside className={styles.brandPanel} aria-hidden="true">
      <span className={styles.brandTopline}>{topline}</span>
      <h2 className={styles.brandHero}>{hero}</h2>
      <p className={styles.brandSub}>{sub}</p>
      <span className={styles.brandFoot}>
        Handcrafted with love · Personalised gifts &amp; stationery
      </span>
    </aside>
  );
}
