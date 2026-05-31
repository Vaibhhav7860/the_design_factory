import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getAccountSnapshot } from "@/lib/services/account";
import AccountSidebar from "@/components/account/AccountSidebar";
import ProfileForm from "@/components/account/ProfileForm";
import AddressManager from "@/components/account/AddressManager";
import PasswordChangeForm from "@/components/account/PasswordChangeForm";
import MarketingToggle from "@/components/account/MarketingToggle";
import SignOutButton from "@/components/account/SignOutButton";
import { formatPrice } from "@/lib/utils";
import styles from "./dashboard.module.css";

export const metadata = { title: "Your account · The Design Factory" };
export const dynamic = "force-dynamic";

const ORDER_DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function AccountHome() {
  const session = await auth();
  if (!session?.user?.email) redirect("/account/sign-in");

  const snapshot = await getAccountSnapshot(session.user.email);
  if (!snapshot) redirect("/account/sign-in");

  const { user, stats, addresses, recentOrders } = snapshot;
  const initials =
    [user.firstName, user.lastName]
      .filter(Boolean)
      .map((p) => p[0])
      .join("")
      .toUpperCase() || (user.email[0] || "?").toUpperCase();
  const memberSince = user.createdAt
    ? ORDER_DATE_FMT.format(new Date(user.createdAt))
    : null;

  return (
    <main className={styles.page} style={{ marginTop: "var(--nav-height)" }}>
      <div className={styles.layout}>
        {/* ── Hero ── */}
        <header className={styles.hero}>
          <div className={styles.heroAvatar}>
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" />
            ) : (
              initials
            )}
          </div>
          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>Welcome back</p>
            <h1 className={styles.heroName}>
              Hi, {user.firstName || user.name?.split(" ")[0] || "there"}
            </h1>
            <p className={styles.heroSub}>
              Signed in as <strong>{user.email}</strong>
              {memberSince ? ` · Member since ${memberSince}` : ""}
            </p>
          </div>
          <SignOutButton />
        </header>

        {/* ── Sidebar ── */}
        <AccountSidebar />

        {/* ── Right column ── */}
        <div>
          {/* Stats */}
          <section className={styles.stats}>
            <div className={styles.statTile}>
              <p className={styles.statLabel}>Orders placed</p>
              <p className={styles.statValue}>{stats.totalOrders}</p>
              <p className={styles.statSub}>
                {stats.totalOrders === 0
                  ? "You haven't ordered yet"
                  : "Across your account"}
              </p>
            </div>
            <div className={styles.statTile}>
              <p className={styles.statLabel}>Lifetime spend</p>
              <p className={styles.statValue}>{formatPrice(stats.lifetimeSpend / 100)}</p>
              <p className={styles.statSub}>
                {stats.lastOrderAt
                  ? `Last order ${ORDER_DATE_FMT.format(new Date(stats.lastOrderAt))}`
                  : "—"}
              </p>
            </div>
            <div className={styles.statTile}>
              <p className={styles.statLabel}>Saved addresses</p>
              <p className={styles.statValue}>{addresses.length}</p>
              <p className={styles.statSub}>
                {addresses.length === 0
                  ? "Add one for faster checkout"
                  : addresses.length === 1
                  ? "One address on file"
                  : `${addresses.length} addresses on file`}
              </p>
            </div>
          </section>

          {/* Recent orders */}
          <section className={styles.card}>
            <header className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Recent orders</h2>
                <p className={styles.cardSubtitle}>
                  Your most recent purchases — track, reorder, or download an
                  invoice.
                </p>
              </div>
              {recentOrders.length > 0 ? (
                <Link href="/account/orders" className={styles.cardLink}>
                  View all →
                </Link>
              ) : null}
            </header>

            {recentOrders.length === 0 ? (
              <div className={styles.emptyOrders}>
                <strong>No orders yet</strong>
                When you place your first order it will show up here.
                <div style={{ marginTop: 14 }}>
                  <Link href="/" className={styles.btnPrimary}>
                    Start shopping
                  </Link>
                </div>
              </div>
            ) : (
              <div className={styles.ordersList}>
                {recentOrders.map((o) => (
                  <OrderRow key={o.id} order={o} />
                ))}
              </div>
            )}
          </section>

          {/* Profile */}
          <section className={styles.card}>
            <header className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Personal details</h2>
                <p className={styles.cardSubtitle}>
                  Keep your name and contact number current so we can reach you
                  about your orders.
                </p>
              </div>
            </header>
            <ProfileForm initial={user} />
          </section>

          {/* Addresses */}
          <section id="addresses" className={styles.card}>
            <header className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Addresses</h2>
                <p className={styles.cardSubtitle}>
                  Save delivery addresses to skip retyping them at checkout.
                </p>
              </div>
            </header>
            <AddressManager initialAddresses={addresses} profile={user} />
          </section>

          {/* Preferences */}
          <section id="preferences" className={styles.card}>
            <header className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Preferences</h2>
                <p className={styles.cardSubtitle}>
                  Decide what we send you and when.
                </p>
              </div>
            </header>
            <MarketingToggle initial={stats.acceptsMarketing} />
          </section>

          {/* Security */}
          <section id="security" className={styles.card}>
            <header className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Sign-in & security</h2>
                <p className={styles.cardSubtitle}>
                  How you sign in to your account.
                </p>
              </div>
            </header>

            {user.googleLinked ? (
              <div className={styles.providerRow}>
                <div className={styles.providerIcon}>G</div>
                <div className={styles.providerMain}>
                  <div className={styles.providerName}>Google</div>
                  <div className={styles.providerSub}>{user.email}</div>
                </div>
                <span className={styles.providerStatus}>Linked</span>
              </div>
            ) : null}

            <PasswordChangeForm hasPassword={user.hasPassword} />

            <hr className={styles.hr} />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <SignOutButton className={styles.btnGhost} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function OrderRow({ order }) {
  const cover = order.lineItems[0]?.productSlug;
  const datePretty = order.createdAt
    ? ORDER_DATE_FMT.format(new Date(order.createdAt))
    : "—";
  const titleSummary =
    order.lineItems.length > 0
      ? order.lineItems
          .slice(0, 2)
          .map((li) => `${li.productTitle || li.productSlug} ×${li.quantity}`)
          .join(", ") +
        (order.lineItems.length > 2
          ? ` +${order.lineItems.length - 2} more`
          : "")
      : "—";

  return (
    <Link href={`/account/orders/${order.orderNumber}`} className={styles.orderRow}>
      <div className={styles.orderThumb}>
        <span className={styles.orderThumbFallback}>
          {(cover || "?")[0]?.toUpperCase()}
        </span>
      </div>
      <div className={styles.orderMeta}>
        <span className={styles.orderNumber}>{order.orderNumber}</span>
        <p className={styles.orderTitle}>{titleSummary}</p>
        <p className={styles.orderSub}>
          {datePretty} · {order.itemCount}{" "}
          {order.itemCount === 1 ? "item" : "items"}
        </p>
      </div>
      <div className={styles.orderTotal}>{formatPrice(order.total / 100)}</div>
      <div>
        <span
          className={`${styles.orderStatus} ${
            order.paymentStatus === "paid"
              ? styles.statusPaid
              : order.paymentStatus === "failed"
              ? styles.statusFailed
              : styles.statusPending
          }`}
        >
          {order.paymentStatus}
        </span>
      </div>
    </Link>
  );
}
