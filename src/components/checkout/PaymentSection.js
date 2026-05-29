import styles from "./PaymentSection.module.css";

export default function PaymentSection() {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Payment</h2>
      
      <div className={styles.securityNote}>
        All transactions are secure and encrypted.
      </div>

      <div className={styles.paymentMethod}>
        <div className={styles.methodHeader}>
          <div className={styles.radioWrapper}>
            <input
              type="radio"
              name="payment"
              value="razorpay"
              checked
              readOnly
              className={styles.radio}
            />
            <span className={styles.methodName}>
              PhonePe PG (UPI, Cards, EMI & NetBanking)
            </span>
          </div>
          <div className={styles.paymentIcons}>
            <img src="/images/payment/upi.svg" alt="UPI" onError={(e) => e.target.style.display = 'none'} />
            <img src="/images/payment/visa.svg" alt="Visa" onError={(e) => e.target.style.display = 'none'} />
            <img src="/images/payment/mastercard.svg" alt="Mastercard" onError={(e) => e.target.style.display = 'none'} />
            <img src="/images/payment/rupay.svg" alt="RuPay" onError={(e) => e.target.style.display = 'none'} />
          </div>
        </div>
        
        <div className={styles.methodInfo}>
          You'll be redirected to Razorpay to complete your purchase.
        </div>
      </div>
    </section>
  );
}
