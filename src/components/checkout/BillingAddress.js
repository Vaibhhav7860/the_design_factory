import styles from "./BillingAddress.module.css";

export default function BillingAddress({ billingAddressSame, setBillingAddressSame, billingInfo, setBillingInfo }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBillingInfo({
      ...billingInfo,
      [name]: value,
    });
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Billing address</h2>

      <label className={styles.radio}>
        <input
          type="radio"
          name="billingAddress"
          checked={billingAddressSame}
          onChange={() => setBillingAddressSame(true)}
        />
        <span>Same as shipping address</span>
      </label>

      <label className={styles.radio}>
        <input
          type="radio"
          name="billingAddress"
          checked={!billingAddressSame}
          onChange={() => setBillingAddressSame(false)}
        />
        <span>Use a different billing address</span>
      </label>

      {!billingAddressSame && (
        <div className={styles.form}>
          <input
            type="text"
            name="address"
            value={billingInfo.address || ""}
            onChange={handleChange}
            placeholder="Address"
            className={styles.input}
          />
          <input
            type="text"
            name="city"
            value={billingInfo.city || ""}
            onChange={handleChange}
            placeholder="City"
            className={styles.input}
          />
          <input
            type="text"
            name="pinCode"
            value={billingInfo.pinCode || ""}
            onChange={handleChange}
            placeholder="PIN code"
            className={styles.input}
            maxLength="6"
          />
        </div>
      )}
    </section>
  );
}
