import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";
import styles from "./PopularPicks.module.css";

const picks = [
  { label: "STATIONERY", href: "/category/gift-stationery", image: "/images/categories/stationery.png" },
  { label: "SCHOOL ESSENTIALS", href: "/category/school-essentials", image: "/images/categories/school.png" },
  { label: "BAGS COLLECTION", href: "/category/bags", image: "/images/categories/bags.png" },
  { label: "COMBO SETS", href: "/category/combos", image: "/images/categories/labels.png" },
  { label: "LABELS", href: "/category/labels", image: "/images/categories/labels_new.png" },
  { label: "GIFT STATIONERY", href: "/category/gift-stationery", image: "/images/categories/gift_stationery.png" },
  { label: "KIDS ACCESSORIES", href: "/category/kids-accessories", image: "/images/categories/kids_accessories.png" },
  { label: "ORGANISERS", href: "/category/organisers", image: "/images/categories/organisers.png" },
];

const pastelColors = [
  "#E6F4F1", "#FDF1F5", "#FCF7E3",
  "#FDF7F1", "#F9FDF1", "#F1FDFD",
  "#FDF1F1", "#FCF7E3",
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
