import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getOrderForCustomer } from "@/lib/services/account";
import AccountSidebar from "@/components/account/AccountSidebar";
import SignOutButton from "@/components/account/SignOutButton";
import { formatPrice } from "@/lib/utils";
import styles from "../../dashboard.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { orderNumber } = await params;
  return {
    title: `Order ${orderNumber} · The Design Factory`,
  };
}

const DATE_TIME = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export default async function OrderDetailPage({ params }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/account/sign-in");

  const { orderNumber } = await params;
  const order = await getOrderForCustomer(session.user.email, orderNumber);
  if (!order) notFound();

  return (
    <main className={styles.page} style={{ marginTop: "var(--nav-height)" }}>
      <div className={styles.layout}>
        <header className={styles.hero}>
          <div className={styles.heroAvatar}>
            {(session.user.name || "?")[0].toUpperCase()}
          </div>
          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>Order</p>
            <h1 className={styles.heroName}>{order.orderNumber}</h1>
            <p className={styles.heroSub}>
              Placed {DATE_TIME.format(new Date(order.createdAt))} ·{" "}
              <span
                style={{
                  fontWeight: 700,
                  color:
                    order.paymentStatus === "paid"
                      ? "#2e7d32"
                      : order.paymentStatus === "failed"
                      ? "#c0392b"
                      : "#b85a3e",
                }}
              >
                {order.paymentStatus}
              </span>
            </p>
          </div>
          <SignOutButton />
        </header>

        <AccountSidebar />

        <div>
          <Link
            href="/account/orders"
            className={styles.cardLink}
            style={{ display: "inline-block", marginBottom: 14 }}
          >
            ← Back to orders
          </Link>

          {/* Items */}
          <section className={styles.card}>
            <header className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Items in this order</h2>
              </div>
            </header>

            <div className={styles.ordersList}>
              {order.lineItems.map((li, idx) => {
                const lineTotal =
                  (li.price + (li.personalisationFee || 0)) * li.quantity;
                const personalisation =
                  li.personalisation && li.personalisation.name
                    ? li.personalisation
                    : null;
                return (
                  <div key={idx} className={styles.orderRow} style={{ cursor: "default" }}>
                    <div className={styles.orderThumb}>
                      <span className={styles.orderThumbFallback}>
                        {(li.productSlug || "?")[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className={styles.orderMeta}>
                      <span className={styles.orderNumber}>
                        {li.productSlug}
                      </span>
                      <p className={styles.orderTitle}>
                        {li.productTitle || li.productSlug}
                      </p>
                      <p className={styles.orderSub}>
                        Qty {li.quantity} · {formatPrice(li.price / 100)} each
                      </p>
                      {personalisation ? (
                        <p
                          className={styles.orderSub}
                          style={{ marginTop: 6 }}
                        >
                          <strong style={{ color: "#3a2800", fontWeight: 600 }}>
                            Personalised:
                          </strong>{" "}
                          {personalisation.name}
                          {personalisation.font
                            ? ` · ${personalisation.font}`
                            : ""}
                          {personalisation.school
                            ? ` · ${personalisation.school}`
                            : ""}
                        </p>
                      ) : null}
                    </div>
                    <div className={styles.orderTotal}>
                      {formatPrice(lineTotal / 100)}
                    </div>
                    <div />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Totals + addresses */}
          <section className={styles.card}>
            <header className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Summary</h2>
              </div>
            </header>

            <dl
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 8,
                fontSize: 13,
              }}
            >
              <dt style={{ color: "#6b6b6b" }}>Subtotal</dt>
              <dd style={{ margin: 0 }}>{formatPrice(order.subtotal / 100)}</dd>

              {order.discount > 0 ? (
                <>
                  <dt style={{ color: "#6b6b6b" }}>Discount</dt>
                  <dd style={{ margin: 0, color: "#2e7d32" }}>
                    −{formatPrice(order.discount / 100)}
                  </dd>
                </>
              ) : null}

              <dt style={{ color: "#6b6b6b" }}>Shipping</dt>
              <dd style={{ margin: 0 }}>{formatPrice(order.shipping / 100)}</dd>

              <dt style={{ color: "#6b6b6b" }}>Tax (incl.)</dt>
              <dd style={{ margin: 0 }}>{formatPrice(order.tax / 100)}</dd>

              <dt
                style={{
                  paddingTop: 10,
                  borderTop: "1px solid rgba(26,16,8,0.06)",
                  fontWeight: 700,
                  color: "#1a1a1a",
                  marginTop: 6,
                }}
              >
                Total paid
              </dt>
              <dd
                style={{
                  margin: 0,
                  paddingTop: 10,
                  borderTop: "1px solid rgba(26,16,8,0.06)",
                  fontWeight: 700,
                  fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
                  fontSize: 18,
                }}
              >
                {formatPrice(order.total / 100)}
              </dd>
            </dl>

            <hr className={styles.hr} />

            <div className={styles.addressGrid}>
              {order.shippingAddress ? (
                <div className={styles.addressCard}>
                  <p className={styles.addressLabel}>Shipping address</p>
                  <p className={styles.addressName}>
                    {order.shippingAddress.name}
                  </p>
                  <p className={styles.addressLines}>
                    {[
                      order.shippingAddress.line1,
                      order.shippingAddress.line2,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                    <br />
                    {[
                      order.shippingAddress.city,
                      order.shippingAddress.state,
                      order.shippingAddress.postalCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                    <br />
                    {order.shippingAddress.country || "IN"}
                  </p>
                  {order.shippingAddress.phone ? (
                    <p
                      className={styles.addressLines}
                      style={{ marginTop: 6 }}
                    >
                      <span className={styles.subtle}>
                        {order.shippingAddress.phone}
                      </span>
                    </p>
                  ) : null}
                </div>
              ) : null}

              {order.razorpayPaymentId ? (
                <div className={styles.addressCard}>
                  <p className={styles.addressLabel}>Payment</p>
                  <p
                    className={styles.addressLines}
                    style={{ fontFamily: "ui-monospace, Menlo, monospace" }}
                  >
                    {order.razorpayPaymentId}
                  </p>
                  <p className={styles.subtle} style={{ marginTop: 6 }}>
                    via Razorpay
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
