import Image from "next/image";
import styles from "./WhyChooseUs.module.css";

const values = [
  {
    label: "IMPECCABLE QUALITY",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="9" r="7"></circle>
        <path d="M12 5l1 2.5 2.5.5-2 1.5.5 2.5-2-1.5-2 1.5.5-2.5-2-.5 2.5-.5z"></path>
        <path d="M9 15.5l-2 4.5 5-2 5 2-2-4.5"></path>
      </svg>
    ),
  },
  {
    label: "UNIQUE DESIGNS",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s-6-3-6-8c0-3.3 2.7-6 6-6s6 2.7 6 6c0 5-6 8-6 8z"></path>
        <path d="M12 21c-2-2-4-5-4-8a4 4 0 1 1 8 0c0 3-2 6-4 8z"></path>
        <path d="M12 13c-1.5 0-3-1-3-2s1-2 3-2 3 1 3 2-1.5 2-3 2z"></path>
        <path d="M5 14c0-2 1-4 3-5M19 14c0-2-1-4-3-5"></path>
      </svg>
    ),
  },
  {
    label: "CUSTOMER SATISFACTION",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="7" r="3"></circle>
        <path d="M12 10c-3 0-5 2-5 4v1"></path>
        <circle cx="6" cy="9" r="2.5"></circle>
        <path d="M6 11.5c-2 0-3 1.5-3 3v.5"></path>
        <circle cx="18" cy="9" r="2.5"></circle>
        <path d="M18 11.5c2 0 3 1.5 3 3v.5"></path>
        <path d="M12 18l-1.5-1.5a2 2 0 1 1 3 0L12 18z" fill="currentColor" stroke="none"></path>
      </svg>
    ),
  },
  {
    label: "WOMEN EMPOWERED",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="6" r="2"></circle>
        <path d="M12 8c-2 0-4 2-4 4s2 4 4 4 4-2 4-4-2-4-4-4z"></path>
        <path d="M8 12c-1 0-2 1-2 2s1 2 2 2M16 12c1 0 2 1 2 2s-1 2-2 2"></path>
        <path d="M12 16v5M10 19h4"></path>
        <path d="M5 12a7 7 0 0 1 14 0"></path>
      </svg>
    ),
  },
  {
    label: "HAND CRAFTED",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 11c0 3-3 6-6 9-3-3-6-6-6-9a3 3 0 1 1 6 0 3 3 0 1 1 6 0z"></path>
        <path d="M5 16s1 2 3 2 4-2 4-2M19 16s-1 2-3 2-4-2-4-2"></path>
        <path d="M10 10l2 2 2-2"></path>
      </svg>
    ),
  },
  {
    label: "SUSTAINABLE PRACTICES",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 6l-4 4 4 4M17 18l4-4-4-4"></path>
        <path d="M3 10h12a4 4 0 0 1 4 4M21 14H9a4 4 0 0 1-4-4"></path>
        <path d="M12 8c0 3 2 4 2 4s2-1 2-4-2-4-2-4-2 1-2 4z"></path>
      </svg>
    ),
  },
];

export default function WhyChooseUs() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <Image
          src="/images/the_design_factory_logo.png"
          alt="The Design Factory Logo"
          width={180}
          height={70}
          className={styles.logo}
        />
        <h2 className={styles.heading}>WHY THE DESIGN FACTORY?</h2>
        <p className={styles.desc}>
          We are a design-led brand offering personalized stationery, invitations &amp; creative direction for heartfelt expressions.
        </p>
      </div>
      <div className={styles.grid}>
        {values.map((item, i) => (
          <div key={i} className={styles.item}>
            <div className={styles.iconWrap}>{item.icon}</div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
