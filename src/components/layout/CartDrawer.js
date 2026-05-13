"use client";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import styles from "./CartDrawer.module.css";

export default function CartDrawer({ open, onClose }) {
  const { cart, cartTotal, updateQuantity, removeFromCart } = useCart();

  return (
    <>
      <div className={`${styles.overlay} ${open ? styles.overlayOpen : ""}`} onClick={onClose} />
      <aside className={`${styles.drawer} ${open ? styles.open : ""}`}>
        <div className={styles.header}>
          <h2 className={styles.heading}>Your Cart</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {cart.length === 0 ? (
          <div className={styles.empty}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            <p className="body-text">Your cart is empty</p>
            <button onClick={onClose} className={styles.continueBtnEmpty}>Continue Shopping</button>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {cart.map((item) => (
                <div key={item.id} className={styles.item}>
                  <div className={styles.itemImage}>
                    <Image src={item.image} alt={item.title} width={72} height={72} style={{ objectFit: "contain" }} />
                  </div>
                  <div className={styles.itemInfo}>
                    <h4 className={styles.itemTitle}>{item.title}</h4>
                    <p className={styles.itemPrice}>{formatPrice(item.price)}</p>
                    <div className={styles.qty}>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)} aria-label="Remove item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
            </div>
            <div className={styles.footer}>
              <div className={styles.total}>
                <span>Subtotal</span>
                <span className="price-current">{formatPrice(cartTotal)}</span>
              </div>
              <Link href="/cart" onClick={onClose} className={styles.checkoutBtn}>
                View Cart & Checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
