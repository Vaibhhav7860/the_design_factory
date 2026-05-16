import Image from "next/image";
import styles from "./CommunityGallery.module.css";

const instaLinks = [
  {
    src: "/images/insta_images/399DFFB7-4721-483D-9FB5-A3178BDA1791.webp",
    href: "https://www.instagram.com/reel/DW-_OuyxfDK/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
  },
  {
    src: "/images/insta_images/687FEE19-B54D-4431-A5B5-D7EB1B66EB61.webp",
    href: "https://www.instagram.com/reel/DTPyhKKjKOZ/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
  },
  {
    src: "/images/insta_images/94F7370F-AB2E-41D6-8EA9-2DA050F35979_f208c605-9bb3-4c0b-aebe-8112c9115826.webp",
    href: "https://www.instagram.com/reel/DQ7O28hkjbb/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
  },
  {
    src: "/images/insta_images/AdultGiftTags-Design1_ArchShape_-04_95879508-0145-493b-89af-6b26f19035c7.webp",
    href: "https://www.instagram.com/reel/DMU_p-cTVQq/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
  },
  {
    src: "/images/insta_images/AdultMoneyEnvelopes-01-06_96629764-477b-46e9-b398-bc5315fa6c95.webp",
    href: "https://www.instagram.com/reel/DI0ULKsxAsN/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
  },
  {
    src: "/images/insta_images/AdultMoneyEnvelopes-02-05.webp",
    href: "https://www.instagram.com/reel/DH89XoAit5M/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
  }
];

export default function CommunityGallery() {
  const galleryItems = [...instaLinks, ...instaLinks, ...instaLinks, ...instaLinks];

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2>JOIN OUR COMMUNITY OF 45K+</h2>
      </div>
      <div className={styles.galleryWrapper}>
        <div className={styles.marqueeContainer}>
          {galleryItems.map((item, i) => (
            <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" className={styles.marqueeItem}>
              <Image
                src={item.src}
                alt={`Instagram Reel ${i + 1}`}
                width={300}
                height={300}
                className={styles.marqueeImage}
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
