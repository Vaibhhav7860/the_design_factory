import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getOrdersForCustomer } from "@/lib/services/account";
import AccountSidebar from "@/components/account/AccountSidebar";
import SignOutButton from "@/components/account/SignOutButton";
import { formatPrice } from "@/lib/utils";
import styles from "../dashboard.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your orders · The Design Factory" };

const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function OrdersListPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/account/sign-in");

  const orders = await getOrdersForCustomer(session.user.email, { limit: 200 });

  return (
    <main className={styles.page} style={{ marginTop: "var(--nav-height)" }}>
      <div className={styles.layout}>
        <header className={styles.hero}>
          <div className={styles.heroAvatar}>
            {(session.user.name || "?")[0].toUpperCase()}
          </div>
          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>Your orders</p>
            <h1 className={styles.heroName}>Order history</h1>
            <p className={styles.heroSub}>
              {orders.length === 0
                ? "You haven't placed an order yet."
                : `${orders.length} ${orders.length === 1 ? "order" : "orders"} on file`}
            </p>
          </div>
          <SignOutButton />
        </header>

        <AccountSidebar />

        <div>
          <section className={styles.card}>
            {orders.length === 0 ? (
              <div className={styles.emptyOrders}>
                <strong>No orders yet</strong>
                Browse the catalog to find something you&apos;ll love.
                <div style={{ marginTop: 14 }}>
                  <Link href="/" className={styles.btnPrimary}>
                    Start shopping
                  </Link>
                </div>
              </div>
            ) : (
              <div className={styles.ordersList}>
                {orders.map((o) => {
                  const titleSummary =
                    o.lineItems
                      .slice(0, 2)
                      .map(
                        (li) =>
                          `${li.productTitle || li.productSlug} ×${li.quantity}`
                      )
                      .join(", ") +
                    (o.lineItems.length > 2
                      ? ` +${o.lineItems.length - 2} more`
                      : "");
                  return (
                    <Link
                      key={o.id}
                      href={`/account/orders/${o.orderNumber}`}
                      className={styles.orderRow}
                    >
                      <div className={styles.orderThumb}>
                        <span className={styles.orderThumbFallback}>
                          {(o.lineItems[0]?.productSlug || "?")[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div className={styles.orderMeta}>
                        <span className={styles.orderNumber}>
                          {o.orderNumber}
                        </span>
                        <p className={styles.orderTitle}>{titleSummary}</p>
                        <p className={styles.orderSub}>
                          {o.createdAt ? DATE_FMT.format(new Date(o.createdAt)) : "—"}
                          {" · "}
                          {o.itemCount} {o.itemCount === 1 ? "item" : "items"}
                        </p>
                      </div>
                      <div className={styles.orderTotal}>
                        {formatPrice(o.total / 100)}
                      </div>
                      <div>
                        <span
                          className={`${styles.orderStatus} ${
                            o.paymentStatus === "paid"
                              ? styles.statusPaid
                              : o.paymentStatus === "failed"
                              ? styles.statusFailed
                              : styles.statusPending
                          }`}
                        >
                          {o.paymentStatus}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
