import Image from "next/image";
import { HiOutlineLockClosed, HiOutlineShieldCheck } from "react-icons/hi";
import { formatPrice } from "@/lib/utils";
import styles from "./OrderSummary.module.css";

export default function OrderSummary({
  cart,
  subtotal,
  comboDiscount,
  shippingCost,
  shippingMethod,
  hasAddress,
  total,
  onPayNow,
  isProcessing,
}) {
  const itemCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Shipping copy mirrors the live total: no address yet → prompt,
  // Standard → Free, Express → the ₹150 surcharge.
  let shippingLabel;
  if (!hasAddress) {
    shippingLabel = <span className={styles.shippingPending}>Calculated at next step</span>;
  } else if (shippingCost > 0) {
    shippingLabel = formatPrice(shippingCost);
  } else {
    shippingLabel = <span className={styles.freeTag}>Free</span>;
  }

  return (
    <div className={styles.summary}>
      <div className={styles.header}>
        <h2 className={styles.title}>Order Summary</h2>
        <span className={styles.itemBadge}>
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Product List */}
      <div className={styles.productsContainer}>
        <div className={styles.products}>
          {cart.map((item) => {
            const imgSrc = item.images?.[0] || item.image || "";
            return (
              <div key={item.slug} className={styles.product}>
                <div className={styles.productImage}>
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={item.title}
                      width={64}
                      height={64}
                      style={{ objectFit: "contain" }}
                    />
                  ) : null}
                  {item.quantity > 1 && (
                    <span className={styles.quantity}>{item.quantity}</span>
                  )}
                </div>
                <div className={styles.productInfo}>
                  <h4 className={styles.productTitle}>{item.title}</h4>
                  <p className={styles.productMeta}>
                    Set of {item.quantity} /
                    {item.personalizationName
                      ? ` Personalized: ${item.personalizationName}`
                      : " Non-Personalized"}
                  </p>
                </div>
                <div className={styles.productPrice}>
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Summary */}
      <div className={styles.priceSummary}>
        <div className={styles.priceRow}>
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {comboDiscount > 0 && (
          <div className={`${styles.priceRow} ${styles.discountRow}`}>
            <span>Combo Discount</span>
            <span className={styles.discountAmount}>-{formatPrice(comboDiscount)}</span>
          </div>
        )}

        <div className={styles.priceRow}>
          <span>Shipping{shippingMethod === "express" ? " · Express" : ""}</span>
          <span>{shippingLabel}</span>
        </div>
      </div>

      {/* Total */}
      <div className={styles.totalSection}>
        <div className={styles.totalRow}>
          <span>Total</span>
          <div className={styles.totalPrice}>
            <span className={styles.currency}>INR</span>
            <span className={styles.amount}>{formatPrice(total)}</span>
          </div>
        </div>
        <p className={styles.taxNote}>Including ₹{Math.round(total * 0.05)} in taxes</p>
      </div>

      {/* Pay Now Button */}
      <button
        className={styles.payNowButton}
        onClick={onPayNow}
        disabled={isProcessing}
      >
        <HiOutlineLockClosed className={styles.payIcon} />
        {isProcessing ? "Processing..." : "Pay Now"}
      </button>

      <div className={styles.secureNote}>
        <HiOutlineShieldCheck />
        <span>Secure checkout · UPI, Cards &amp; Netbanking via Razorpay</span>
      </div>
    </div>
  );
}
