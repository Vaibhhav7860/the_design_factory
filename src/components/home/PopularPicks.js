import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";
import styles from "./PopularPicks.module.css";


const pastelColors = [
  "#E6F4F1", "#FDF1F5", "#FCF7E3",
  "#FDF7F1", "#F9FDF1", "#F1FDFD",
  "#FDF1F1", "#FCF7E3",
];

import { connectToDatabase } from "@/lib/db/mongoose";
import { Category } from "@/lib/db/models";

export default async function PopularPicks() {
  await connectToDatabase();
  const dbCategories = await Category.find({}).lean();

  const picks = [
    { label: "STATIONERY", slug: "gift-stationery", href: "/category/gift-stationery", fallbackImage: "/images/categories/stationery.png" },
    { label: "SCHOOL ESSENTIALS", slug: "school-essentials", href: "/category/school-essentials", fallbackImage: "/images/categories/school.png" },
    { label: "BAGS COLLECTION", slug: "bags", href: "/category/bags", fallbackImage: "/images/categories/bags.png" },
    { label: "COMBO SETS", slug: "combos", href: "/category/combos", fallbackImage: "/images/categories/labels.png" },
    { label: "LABELS", slug: "labels", href: "/category/labels", fallbackImage: "/images/categories/labels_new.png" },
    { label: "GIFT STATIONERY", slug: "gift-stationery", href: "/category/gift-stationery", fallbackImage: "/images/categories/gift_stationery.png" },
    { label: "KIDS ACCESSORIES", slug: "kids-accessories", href: "/category/kids-accessories", fallbackImage: "/images/categories/kids_accessories.png" },
    { label: "ORGANISERS", slug: "organisers", href: "/category/organisers", fallbackImage: "/images/categories/organisers.png" },
  ].map(pick => {
    const dbCat = dbCategories.find(c => c.slug === pick.slug);
    return {
      ...pick,
      image: dbCat && dbCat.image ? dbCat.image : pick.fallbackImage
    };
  });

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
