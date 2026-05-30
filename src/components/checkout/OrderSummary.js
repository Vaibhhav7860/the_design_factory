import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import styles from "./OrderSummary.module.css";

export default function OrderSummary({
  cart,
  subtotal,
  comboDiscount,
  shippingCost,
  appliedDiscount,
  total,
  discountCode,
  setDiscountCode,
  onApplyDiscount,
  onRemoveDiscount,
  onPayNow,
  isProcessing,
}) {
  return (
    <div className={styles.summary}>
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

      {/* Discount Code */}
      <div className={styles.discountSection}>
        <div className={styles.discountInput}>
          <input
            type="text"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
            placeholder="Discount code or gift card"
            className={styles.input}
            disabled={appliedDiscount}
          />
          {appliedDiscount ? (
            <button onClick={onRemoveDiscount} className={styles.removeBtn}>
              Remove
            </button>
          ) : (
            <button onClick={onApplyDiscount} className={styles.applyBtn}>
              Apply
            </button>
          )}
        </div>
      </div>

      {/* Price Summary - Simple Format */}
      <div className={styles.priceSummary}>
        <div className={styles.priceRow}>
          <span>Subtotal · {cart.length} items</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {/* Combo Discount - Only show if there's a discount */}
        {comboDiscount > 0 && (
          <div className={`${styles.priceRow} ${styles.discountRow}`}>
            <span>Combo Discount</span>
            <span className={styles.discountAmount}>-{formatPrice(comboDiscount)}</span>
          </div>
        )}

        <div className={styles.priceRow}>
          <span>Shipping</span>
          <span>
            {shippingCost === 0 ? "Enter shipping address" : formatPrice(shippingCost)}
          </span>
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
        <p className={styles.taxNote}>Including ₹{Math.round(total * 0.18)} in taxes</p>
      </div>

      {/* Pay Now Button */}
      <button
        className={styles.payNowButton}
        onClick={onPayNow}
        disabled={isProcessing}
      >
        {isProcessing ? "Processing..." : "PAY NOW"}
      </button>
    </div>
  );
}
