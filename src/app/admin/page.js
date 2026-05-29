import { Suspense } from "react";
import PageHeader from "@/components/admin/PageHeader";
import { Card, CardHeader, StatTile, EmptyState } from "@/components/admin/Card";
import { Button } from "@/components/admin/Button";
import DataTable, { StatusPill } from "@/components/admin/DataTable";
import DateRangePicker from "@/components/admin/DateRangePicker";
import { HiOutlineRefresh, HiOutlineDownload, HiOutlineInbox } from "react-icons/hi";
import { auth } from "@/lib/auth/config";
import { getDashboardSnapshot } from "@/lib/services/dashboard";
import { parseRangeFromParams } from "@/lib/dateRange";
import styles from "./dashboard.module.css";

export const metadata = {
  title: "Home · Admin",
};

// Period selector (Today / 7d / 30d / 90d / Custom) is encoded in the URL,
// so the dashboard must always render fresh data per request.
export const dynamic = "force-dynamic";

export default async function AdminHomePage({ searchParams }) {
  const session = await auth();
  const greetingName =
    (session?.user?.name || session?.user?.email || "").split(" ")[0] || "there";

  // searchParams is a Promise in Next.js 16
  const params = (await searchParams) || {};
  const range = parseRangeFromParams(params);

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="At a glance"
        title={
          <>
            Good {greetingHour()}, <em>{greetingName}</em>.
          </>
        }
        description="A quick read on sales, orders and customer activity."
        actions={
          <>
            <DateRangePicker />
            <Button variant="secondary" iconLeft={<HiOutlineDownload />}>
              Export
            </Button>
          </>
        }
      />

      <Suspense key={JSON.stringify(params)} fallback={<DashboardSkeleton />}>
        <DashboardContent range={range} />
      </Suspense>
    </div>
  );
}

function greetingHour() {
  const h = new Date().getHours();
  if (h < 5) return "evening";
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

async function DashboardContent({ range }) {
  const snapshot = await getDashboardSnapshot({ from: range.from, to: range.to });

  return (
    <>
      <section className={styles.statsGrid}>
        <Card>
          <StatTile
            label="Sales"
            value={snapshot.sales.value}
            change={snapshot.sales.change}
            tone={snapshot.sales.tone}
          />
        </Card>
        <Card>
          <StatTile
            label="Orders"
            value={snapshot.orders.value}
            change={snapshot.orders.change}
            tone={snapshot.orders.tone}
          />
        </Card>
        <Card>
          <StatTile
            label="New customers"
            value={snapshot.newCustomers.value}
            change={snapshot.newCustomers.change}
            tone={snapshot.newCustomers.tone}
          />
        </Card>
        <Card>
          <StatTile
            label="Conversion rate"
            value={snapshot.conversionRate.value}
            change={snapshot.conversionRate.change}
            tone={snapshot.conversionRate.tone}
          />
        </Card>
      </section>

      <section className={styles.workQueue}>
        <Card>
          <CardHeader title="To-do" subtitle="Quick actions waiting on you." />
          <ul className={styles.todo}>
            <li>
              <span className={styles.todoCount}>{snapshot.unfulfilledOrders}</span>
              <div>
                <strong>Orders to fulfil</strong>
                <p>Print labels and dispatch.</p>
              </div>
              <Button variant="ghost" size="sm" href="/admin/orders?status=unfulfilled">
                View
              </Button>
            </li>
            <li>
              <span className={styles.todoCount}>{snapshot.bulkEnquiries}</span>
              <div>
                <strong>Bulk enquiries</strong>
                <p>Awaiting first reply.</p>
              </div>
              <Button variant="ghost" size="sm" href="/admin/marketing/bulk-enquiries">
                View
              </Button>
            </li>
            <li>
              <span className={styles.todoCount}>{snapshot.lowStockVariants}</span>
              <div>
                <strong>Low-stock variants</strong>
                <p>Stock below the threshold.</p>
              </div>
              <Button variant="ghost" size="sm" href="/admin/products/inventory">
                View
              </Button>
            </li>
          </ul>
        </Card>
      </section>

      <section className={styles.twoCol}>
        <Card>
          <CardHeader
            title="Recent orders"
            subtitle="The 10 most recent in the selected period."
            actions={<Button variant="ghost" size="sm" href="/admin/orders">All orders</Button>}
          />
          {snapshot.recentOrders.length ? (
            <DataTable
              columns={[
                {
                  key: "orderNumber",
                  header: "Order",
                  render: (o) => <span className={styles.orderNum}>{o.orderNumber}</span>,
                },
                { key: "customerName", header: "Customer" },
                {
                  key: "paymentStatus",
                  header: "Payment",
                  render: (o) => (
                    <StatusPill tone={o.paymentStatus === "paid" ? "positive" : "warning"}>
                      {o.paymentStatus}
                    </StatusPill>
                  ),
                },
                {
                  key: "fulfilmentStatus",
                  header: "Fulfilment",
                  render: (o) => (
                    <StatusPill
                      tone={
                        o.fulfilmentStatus === "fulfilled"
                          ? "positive"
                          : o.fulfilmentStatus === "cancelled"
                          ? "danger"
                          : "neutral"
                      }
                    >
                      {o.fulfilmentStatus}
                    </StatusPill>
                  ),
                },
                {
                  key: "total",
                  header: "Total",
                  align: "right",
                  render: (o) => o.totalDisplay,
                },
              ]}
              rows={snapshot.recentOrders}
            />
          ) : (
            <EmptyState
              icon={<HiOutlineInbox />}
              title="No orders in this period"
              description="Pick a wider date range, or wait for the next sale to come in."
            />
          )}
        </Card>

        <Card>
          <CardHeader
            title="Top products"
            subtitle="Best-sellers in the selected period."
            actions={<Button variant="ghost" size="sm" href="/admin/products">All products</Button>}
          />
          {snapshot.topProducts.length ? (
            <ol className={styles.topList}>
              {snapshot.topProducts.map((p, i) => (
                <li key={p.id}>
                  <span className={styles.rank}>{String(i + 1).padStart(2, "0")}</span>
                  <div className={styles.topProductMeta}>
                    <strong>{p.title}</strong>
                    <span>{p.unitsSold} sold · {p.revenueDisplay}</span>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState
              icon={<HiOutlineInbox />}
              title="No sales in this period"
              description="Top sellers will appear once orders come in."
            />
          )}
        </Card>
      </section>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className={styles.statsGrid}>
      {[0, 1, 2, 3].map((i) => (
        <Card key={i}>
          <div className={styles.skeletonLabel} />
          <div className={styles.skeletonValue} />
        </Card>
      ))}
    </div>
  );
}
