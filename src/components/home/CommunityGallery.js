import Image from "next/image";
import styles from "./CommunityGallery.module.css";
import { INSTAGRAM_DEFAULT_CARDS } from "@/data/instagramDefaults";

const instaLinks = INSTAGRAM_DEFAULT_CARDS.map((c) => ({ src: c.url, href: c.href }));

export default function CommunityGallery({ items }) {
  // Admin-managed cards take priority; fall back to the bundled defaults
  // so the strip is never empty before the section is configured.
  const source = Array.isArray(items) && items.length > 0 ? items : instaLinks;
  // Repeat the set 4× so the -25% marquee loop is seamless.
  const galleryItems = [...source, ...source, ...source, ...source];

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2>JOIN OUR GROWING INSTAGRAM COMMUNITY</h2>
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
