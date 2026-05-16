import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";
import styles from "./PopularPicks.module.css";

const picks = [
  { label: "STATIONERY", href: "/category/gift-stationery", image: "/images/categories/stationery.png" },
  { label: "SCHOOL ESSENTIALS", href: "/category/school-essentials", image: "/images/categories/school.png" },
  { label: "BAGS COLLECTION", href: "/category/bags", image: "/images/categories/bags.png" },
  { label: "COMBO SETS", href: "/category/combos", image: "/images/categories/labels.png" },
];

const pastelColors = [
  "#E6F4F1", "#FDF1F5", "#F1F1FD",
  "#FDF7F1", "#F9FDF1", "#F1FDFD",
];

export default function PopularPicks() {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {picks.map((pick, i) => (
          <ScrollReveal key={i} delay={i * 0.1}>
            <Link
              href={pick.href}
              className={styles.card}
              style={{ backgroundColor: pastelColors[i] }}
            >
              <div className={styles.badge}>{pick.label}</div>
              <div className={styles.imageWrapper}>
                <Image
                  src={pick.image}
                  alt={pick.label}
                  width={600}
                  height={420}
                  className={styles.image}
                />
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
