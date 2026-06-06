import styles from "./ContactForm.module.css";

export default function ContactForm({ contactInfo, setContactInfo }) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setContactInfo({
      ...contactInfo,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <section className={styles.section}>
      <div className={styles.headerRow}>
        <h2 className={styles.heading}>Contact</h2>
        <a href="/login" className={styles.signInLink}>Sign in</a>
      </div>
      
      <div className={styles.inputGroup}>
        <input
          type="email"
          name="email"
          value={contactInfo.email}
          onChange={handleChange}
          placeholder="Email"
          className={styles.input}
          required
        />
      </div>

      <label className={styles.checkbox}>
        <input
          type="checkbox"
          name="whatsappUpdates"
          checked={!!contactInfo.whatsappUpdates}
          onChange={handleChange}
        />
        <span className={styles.checkmark}></span>
        <span>Get order updates on WhatsApp and/or SMS</span>
      </label>

      <label className={styles.checkbox}>
        <input
          type="checkbox"
          name="emailOffers"
          checked={!!contactInfo.emailOffers}
          onChange={handleChange}
        />
        <span className={styles.checkmark}></span>
        <span>Email me with news and offers</span>
      </label>
    </section>
  );
}
