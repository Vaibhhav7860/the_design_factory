import Link from "next/link";
import ClearCartOnMount from "./ClearCartOnMount";
import styles from "./success.module.css";

export const metadata = {
  title: "Thank you for shopping with The Design Factory",
};

export default async function CheckoutSuccessPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const orderNumber = sp.orderNumber ? String(sp.orderNumber) : null;

  return (
    <main className={styles.page}>
      <ClearCartOnMount />
      <div className={styles.card}>
        <div className={styles.tickWrap} aria-hidden="true">
          <svg
            viewBox="0 0 64 64"
            width="64"
            height="64"
            className={styles.tick}
          >
            <circle cx="32" cy="32" r="30" className={styles.tickRing} />
            <path
              d="M18 33 l10 10 l18 -22"
              fill="none"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.tickPath}
            />
          </svg>
        </div>

        <p className={styles.eyebrow}>Payment received</p>
        <h1 className={styles.title}>
          Thank you for shopping with The Design Factory
        </h1>
        <p className={styles.body}>
          Your order has been received and we&apos;ll begin crafting it with
          love. We&apos;ll be in touch as soon as your parcel ships.
        </p>

        {orderNumber ? (
          <div className={styles.orderRow}>
            <span className={styles.orderLabel}>Order number</span>
            <span className={styles.orderValue}>{orderNumber}</span>
          </div>
        ) : null}

        <div className={styles.actions}>
          <Link href="/" className={styles.primary}>
            Continue shopping
          </Link>
          <Link href="/account/orders" className={styles.secondary}>
            View your orders
          </Link>
        </div>

        <p className={styles.foot}>
          Questions? Write to us at{" "}
          <a href="mailto:[email protected]" className={styles.inlineLink}>
            [email protected]
          </a>
          .
        </p>
      </div>
    </main>
  );
}
