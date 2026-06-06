import styles from "./DeliveryForm.module.css";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function DeliveryForm({ deliveryInfo, setDeliveryInfo }) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDeliveryInfo({
      ...deliveryInfo,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Delivery</h2>

      <div className={styles.inputGroup}>
        <select
          name="country"
          value={deliveryInfo.country}
          onChange={handleChange}
          className={styles.select}
        >
          <option value="India">India</option>
        </select>
      </div>

      <div className={styles.row}>
        <input
          type="text"
          name="firstName"
          value={deliveryInfo.firstName}
          onChange={handleChange}
          placeholder="First name"
          className={styles.input}
          required
        />
        <input
          type="text"
          name="lastName"
          value={deliveryInfo.lastName}
          onChange={handleChange}
          placeholder="Last name"
          className={styles.input}
          required
        />
      </div>

      <div className={styles.inputGroup}>
        <input
          type="text"
          name="address"
          value={deliveryInfo.address}
          onChange={handleChange}
          placeholder="Address"
          className={styles.input}
          required
        />
      </div>

      <div className={styles.inputGroup}>
        <input
          type="text"
          name="apartment"
          value={deliveryInfo.apartment}
          onChange={handleChange}
          placeholder="Apartment, suite, etc. (optional)"
          className={styles.input}
        />
      </div>

      <div className={styles.row3}>
        <input
          type="text"
          name="city"
          value={deliveryInfo.city}
          onChange={handleChange}
          placeholder="City"
          className={styles.input}
          required
        />
        <select
          name="state"
          value={deliveryInfo.state}
          onChange={handleChange}
          className={styles.select}
          required
        >
          <option value="">State</option>
          {indianStates.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="pinCode"
          value={deliveryInfo.pinCode}
          onChange={handleChange}
          placeholder="PIN code"
          className={styles.input}
          maxLength="6"
          pattern="[0-9]{6}"
          required
        />
      </div>

      <div className={styles.inputGroup}>
        <input
          type="tel"
          name="phone"
          value={deliveryInfo.phone}
          onChange={handleChange}
          placeholder="Phone"
          className={styles.input}
          maxLength="10"
          pattern="[0-9]{10}"
          required
        />
      </div>

      <label className={styles.checkbox}>
        <input
          type="checkbox"
          name="saveInfo"
          checked={!!deliveryInfo.saveInfo}
          onChange={handleChange}
        />
        <span className={styles.checkmark}></span>
        <span>Save this information for next time</span>
      </label>

      <label className={styles.checkbox}>
        <input
          type="checkbox"
          name="textOffers"
          checked={!!deliveryInfo.textOffers}
          onChange={handleChange}
        />
        <span className={styles.checkmark}></span>
        <span>Text me with news and offers</span>
      </label>
    </section>
  );
}
