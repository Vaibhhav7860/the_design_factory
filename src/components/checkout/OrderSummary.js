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
}) {
  return (
    <div className={styles.summary}>
      {/* Product List */}
      <div className={styles.products}>
        {cart.map((item) => (
          <div key={item.slug} className={styles.product}>
            <div className={styles.productImage}>
              <Image
                src={item.images?.[0] || item.image || "/images/products/placeholder.png"}
                alt={item.title}
                width={64}
                height={64}
                style={{ objectFit: "contain" }}
              />
              {item.quantity > 1 && (
                <span className={styles.quantity}>{item.quantity}</span>
              )}
            </div>
            <div className={styles.productInfo}>
              <h4 className={styles.productTitle}>{item.title}</h4>
              {item.isComboItem && (
                <span className={styles.comboBadge}>Combo Item</span>
              )}
            </div>
            <div className={styles.productPrice}>
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
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

      {/* Price Breakdown */}
      <div className={styles.breakdown}>
        <div className={styles.row}>
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {comboDiscount > 0 && (
          <div className={styles.row + " " + styles.discount}>
            <span>Combo Discount</span>
            <span>-{formatPrice(comboDiscount)}</span>
          </div>
        )}

        {appliedDiscount && (
          <div className={styles.row + " " + styles.discount}>
            <span>Discount ({appliedDiscount.code})</span>
            <span>-{formatPrice(appliedDiscount.amount)}</span>
          </div>
        )}

        <div className={styles.row}>
          <span>Shipping</span>
          <span>
            {shippingCost === 0 ? "Enter shipping address" : formatPrice(shippingCost)}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className={styles.total}>
        <span>Total</span>
        <div className={styles.totalAmount}>
          <span className={styles.currency}>INR</span>
          <span className={styles.amount}>{formatPrice(total)}</span>
        </div>
      </div>

      <div className={styles.taxNote}>Including ₹{Math.round(total * 0.18)} in taxes</div>
    </div>
  );
}
