import LoginForm from "@/components/admin/LoginForm";
import styles from "./login.module.css";

export const metadata = {
  title: "Sign in · Admin",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage({ searchParams }) {
  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <header className={styles.brand}>
          <span className={styles.brandLabel}>The Design Factory</span>
          <h1 className={styles.brandTitle}>
            <em>Admin</em> sign-in
          </h1>
          <p className={styles.brandTagline}>
            Welcome back. Sign in to manage the store, orders and content.
          </p>
        </header>

        <LoginForm searchParams={searchParams} />

        <footer className={styles.foot}>
          <span>Need access? Ask an existing admin to invite you.</span>
        </footer>
      </div>

      <aside className={styles.aside} aria-hidden="true">
        <div className={styles.asideInner}>
          <div className={styles.swatchRow}>
            <span className={styles.swatch} style={{ background: "#FCD589" }} />
            <span className={styles.swatch} style={{ background: "#FBC9BC" }} />
            <span className={styles.swatch} style={{ background: "#D7E4E4" }} />
          </div>
          <p className={styles.asideHeading}>Crafted with care.</p>
          <p className={styles.asideBody}>
            The admin panel is designed in the same editorial language as the
            storefront. Considered, considered, and considered again.
          </p>
        </div>
      </aside>
    </div>
  );
}
