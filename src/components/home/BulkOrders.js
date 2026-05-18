import Link from "next/link";
import Image from "next/image";
import styles from "./BulkOrders.module.css";

export default function BulkOrders() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.contentLeft}>
          <h2 className={styles.heading}>Bulk Orders</h2>
          <p className={styles.text}>
            Planning a birthday party, corporate event, or a special celebration? 
            Our personalized products make the perfect return gifts. Enjoy exclusive 
            pricing, customized packaging, and priority delivery when you order in bulk.
          </p>
          <Link href="/bulk-orders" className={styles.ctaButton}>
            Enquire Now
          </Link>
        </div>
        <div className={styles.imageRight}>
          <div className={styles.outerShell}>
            <div className={styles.innerCore}>
              <Image 
                src="/images/bulk_order_banner.png" 
                alt="Bulk Orders"
                width={1200}
                height={800}
                className={styles.bannerImage}
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
