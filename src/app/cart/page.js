"use client";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import SectionTitle from "@/components/ui/SectionTitle";
import styles from "./cart.module.css";

export default function CartPage() {
  const { cart, cartTotal, cartSubtotal, comboDiscount, comboDiscountPercent, updateQuantity, removeFromCart, clearCart } = useCart();

  if (cart.length === 0) {
    return (
      <section className={styles.page}>
        <div className="container">
          <div className={styles.empty}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            <h2 className={styles.emptyTitle}>Your Cart is Empty</h2>
            <p className="body-text">Looks like you haven&apos;t added anything yet.</p>
            <Link href="/" className={styles.shopBtn}>Continue Shopping</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className="container">
        <SectionTitle title="Your Cart" />
        <div className={styles.layout}>
          <div className={styles.items}>
            {cart.map((item) => (
              <div key={item.slug} className={styles.item}>
                <div className={styles.itemImage}>
                  <Image src={item.image} alt={item.title} width={100} height={100} style={{ objectFit: "contain" }} />
                </div>
                <div className={styles.itemInfo}>
                  <Link href={`/product/${item.slug.split('__')[0]}`} className={styles.itemTitle}>{item.title}</Link>
                  <p className={styles.itemPrice}>{formatPrice(item.price)}</p>
                </div>
                <div className={styles.itemQty}>
                  <button onClick={() => updateQuantity(item.slug, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.slug, item.quantity + 1)}>+</button>
                </div>
                <p className={styles.itemTotal}>{formatPrice(item.price * item.quantity)}</p>
                <button className={styles.removeBtn} onClick={() => removeFromCart(item.slug)} aria-label="Remove">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            ))}
          </div>

          <aside className={styles.summary}>
            <h3 className={styles.summaryTitle}>Order Summary</h3>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>{formatPrice(cartSubtotal)}</span>
            </div>
            {comboDiscount > 0 && (
              <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                <span>Combo Discount ({comboDiscountPercent}%)</span>
                <span className={styles.discountValue}>-{formatPrice(comboDiscount)}</span>
              </div>
            )}
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span className={styles.freeShip}>Free</span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>Total</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <a href="https://wa.me/919981133225" target="_blank" rel="noopener noreferrer" className={styles.checkoutBtn}>
              Proceed to Checkout
            </a>
            <Link href="/" className={styles.continueBtn}>Continue Shopping</Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
