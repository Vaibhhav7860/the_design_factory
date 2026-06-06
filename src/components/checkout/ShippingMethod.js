import { HiOutlineTruck, HiOutlineLightningBolt } from "react-icons/hi";
import styles from "./ShippingMethod.module.css";

export default function ShippingMethod({ shippingMethod, setShippingMethod, hasAddress }) {
  const shippingOptions = [
    {
      id: "standard",
      name: "Standard Shipping",
      cost: 0,
      duration: "5–7 business days",
      icon: HiOutlineTruck,
    },
    {
      id: "express",
      name: "Express Shipping",
      cost: 150,
      duration: "2–3 business days",
      icon: HiOutlineLightningBolt,
    },
  ];

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Shipping method</h2>

      {!hasAddress ? (
        <div className={styles.placeholder}>
          Enter your shipping address to view available shipping methods.
        </div>
      ) : (
        <div className={styles.options}>
          {shippingOptions.map((option) => {
            const Icon = option.icon;
            return (
              <label key={option.id} className={styles.option}>
                <input
                  type="radio"
                  name="shippingMethod"
                  value={option.id}
                  checked={shippingMethod === option.id}
                  onChange={() => setShippingMethod(option.id)}
                  className={styles.radio}
                />
                <span className={styles.iconWrap} aria-hidden="true">
                  <Icon />
                </span>
                <div className={styles.optionContent}>
                  <div className={styles.optionName}>{option.name}</div>
                  <div className={styles.optionDuration}>{option.duration}</div>
                </div>
                <div
                  className={`${styles.optionPrice} ${
                    option.cost === 0 ? styles.freePrice : ""
                  }`}
                >
                  {option.cost === 0 ? "Free" : `₹${option.cost}`}
                </div>
              </label>
            );
          })}
        </div>
      )}
    </section>
  );
}
