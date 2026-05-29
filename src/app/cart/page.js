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
            <Link href="/checkout" className={styles.checkoutBtn}>
              Proceed to Checkout
            </Link>
            <a href="https://wa.me/919981133225" target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp Us
            </a>
            <Link href="/" className={styles.continueBtn}>Continue Shopping</Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
