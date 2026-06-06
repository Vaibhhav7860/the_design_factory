import { HiOutlineLockClosed } from "react-icons/hi";
import styles from "./PaymentSection.module.css";

const METHODS = ["UPI", "Cards", "EMI", "NetBanking"];

export default function PaymentSection() {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Payment</h2>

      <div className={styles.securityNote}>
        <HiOutlineLockClosed />
        <span>All transactions are secure and encrypted.</span>
      </div>

      {/* Non-selectable: a single gateway, shown for information only. */}
      <div className={styles.paymentMethod}>
        <div className={styles.methodHeader}>
          <span className={styles.methodName}>
            Razorpay (UPI, Cards, EMI &amp; NetBanking)
          </span>
          <div className={styles.methodTags}>
            {METHODS.map((m) => (
              <span key={m} className={styles.tag}>
                {m}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.methodInfo}>
          You&apos;ll be redirected to Razorpay to complete your purchase securely.
        </div>
      </div>
    </section>
  );
}
