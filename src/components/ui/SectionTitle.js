import styles from "./SectionTitle.module.css";

export default function SectionTitle({ title, subtitle, decorative, centered = true }) {
  return (
    <div className={`${styles.wrapper} ${centered ? styles.centered : ""}`}>
      {decorative && <p className={`heading-decorative ${styles.decorative}`}>{decorative}</p>}
      <h2 className={`heading-primary ${styles.title}`}>{title}</h2>
      {subtitle && <p className={`body-text ${styles.subtitle}`}>{subtitle}</p>}
      <div className={`gold-line ${centered ? "gold-line-center" : ""}`} />
    </div>
  );
}
