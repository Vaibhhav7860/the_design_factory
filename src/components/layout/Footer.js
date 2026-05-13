import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.goldBorder} />
      <div className={`container ${styles.grid}`}>
        <div className={styles.col}>
          <h3 className={styles.brand}>The Design Factory</h3>
          <p className={styles.tagline}>Handcrafted with Love</p>
          <p className="body-text" style={{ fontSize: "0.88rem" }}>
            Crafting unique gifts & personalised merchandise for your loved ones.
            Discover Back to school essentials & Party favours.
          </p>
        </div>
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Quick Links</h4>
          <ul className={styles.list}>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/category/labels">Labels</Link></li>
            <li><Link href="/category/school-essentials">School Essentials</Link></li>
            <li><Link href="/category/gift-stationery">Gift Stationery</Link></li>
            <li><Link href="/category/bags">Bags</Link></li>
          </ul>
        </div>
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Info</h4>
          <ul className={styles.list}>
            <li><Link href="#">About Us</Link></li>
            <li><Link href="#">Contact Us</Link></li>
            <li><Link href="#">Shipping Policy</Link></li>
            <li><Link href="#">Return & Refund Policy</Link></li>
            <li><Link href="#">FAQ</Link></li>
          </ul>
        </div>
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Reach Us</h4>
          <ul className={styles.list}>
            <li><a href="tel:+919981133225">+91 99811 33225</a></li>
            <li><a href="mailto:info@thedesignfactoryshop.com">info@thedesignfactoryshop.com</a></li>
          </ul>
          <div className={styles.newsletter}>
            <p style={{ fontSize: "0.82rem", marginBottom: "8px", fontWeight: 500 }}>Subscribe for Updates</p>
            <div className={styles.inputWrap}>
              <input type="email" placeholder="your@email.com" className={styles.input} />
              <button className={styles.subBtn}>→</button>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} The Design Factory. All rights reserved.</p>
      </div>
    </footer>
  );
}
