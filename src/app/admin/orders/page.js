import PageHeader from "@/components/admin/PageHeader";
import { Card, EmptyState } from "@/components/admin/Card";
import { Button } from "@/components/admin/Button";
import DataTable, { StatusPill } from "@/components/admin/DataTable";
import ListToolbar from "@/components/admin/ListToolbar";
import Pagination from "@/components/admin/Pagination";
import ExportButton from "@/components/admin/ExportButton";
import { HiOutlineInbox, HiOutlinePlus } from "react-icons/hi";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Order } from "@/lib/db/models";
import { formatINR, formatDateTime } from "@/lib/format";
import { parsePagination, textFilter } from "@/lib/pagination";

export const metadata = { title: "Orders · Admin" };

const STATUS_FILTERS = {
  unfulfilled: { fulfilmentStatus: "unfulfilled" },
  paid: { paymentStatus: "paid" },
  refunded: { paymentStatus: { $in: ["refunded", "partially_refunded"] } },
};

export default async function OrdersPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const { q, page, perPage, skip, limit } = parsePagination(sp);
  const status = sp.status || "all";

  let orders = [];
  let matchedTotal = 0;
  let counts = { all: 0, unfulfilled: 0, paid: 0, refunded: 0 };

  try {
    await connectToDatabase();

    // Compose status filter + free-text search
    const statusFilter = STATUS_FILTERS[status] || {};
    const search = textFilter(q, [
      "orderNumber",
      "customerName",
      "customerEmail",
      "customerPhone",
    ]);
    const filter = search ? { ...statusFilter, ...search } : statusFilter;

    [orders, matchedTotal, counts.all, counts.unfulfilled, counts.paid, counts.refunded] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
      Order.countDocuments({}),
      Order.countDocuments(STATUS_FILTERS.unfulfilled),
      Order.countDocuments(STATUS_FILTERS.paid),
      Order.countDocuments(STATUS_FILTERS.refunded),
    ]);
  } catch {
    // DB not configured yet — render empty state
  }

  return (
    <div>
      <PageHeader
        eyebrow="Order management"
        title="Orders"
        description="Browse, fulfil, refund and cancel customer orders."
        actions={
          <>
            <ExportButton
              resource="orders"
              filename="orders_export.csv"
              apiPath="/api/admin/orders/export"
              total={counts.all}
              matchedTotal={matchedTotal}
              currentPage={page}
              currentPerPage={perPage}
              currentQuery={q}
              extraQuery={status !== "all" ? { status } : {}}
            />
            <Button variant="primary" iconLeft={<HiOutlinePlus />}>Create order</Button>
          </>
        }
      />

      <Card padded={false}>
        <Tabs status={status} counts={counts} q={q} />
        <ListToolbar
          placeholder="Search by order number, customer name, email or phone"
          total={counts.all}
          matchedTotal={matchedTotal}
          label="orders"
        />

        {orders.length ? (
          <>
            <DataTable
              columns={[
                { key: "orderNumber", header: "Order", render: (o) => <span style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12 }}>{o.orderNumber}</span> },
                { key: "createdAt", header: "Date", render: (o) => formatDateTime(o.createdAt) },
                { key: "customerName", header: "Customer", render: (o) => o.customerName || "Guest" },
                { key: "total", header: "Total", align: "right", render: (o) => formatINR(o.total ?? 0) },
                { key: "paymentStatus", header: "Payment", render: (o) => <StatusPill tone={o.paymentStatus === "paid" ? "positive" : "warning"}>{o.paymentStatus}</StatusPill> },
                { key: "fulfilmentStatus", header: "Fulfilment", render: (o) => <StatusPill tone={o.fulfilmentStatus === "fulfilled" ? "positive" : o.fulfilmentStatus === "cancelled" ? "danger" : "neutral"}>{o.fulfilmentStatus}</StatusPill> },
              ]}
              rows={orders.map((o) => ({ ...o, id: String(o._id) }))}
              rowHref={(row) => `/admin/orders/${row.id}`}
            />
            <Pagination
              total={matchedTotal}
              page={page}
              perPage={perPage}
              label="orders"
            />
          </>
        ) : q ? (
          <EmptyState
            icon={<HiOutlineInbox />}
            title={`No orders match "${q}"`}
            description="Try a different order number, customer name, email or phone."
          />
        ) : (
          <EmptyState
            icon={<HiOutlineInbox />}
            title="No orders to show"
            description="Once a customer places an order, it'll appear here."
          />
        )}
      </Card>
    </div>
  );
}

function Tabs({ status, counts, q }) {
  const tabs = [
    { key: "all", label: "All", count: counts.all },
    { key: "unfulfilled", label: "Unfulfilled", count: counts.unfulfilled },
    { key: "paid", label: "Paid", count: counts.paid },
    { key: "refunded", label: "Refunded", count: counts.refunded },
  ];

  // Preserve search query when switching tabs; reset pagination
  const buildHref = (key) => {
    const params = new URLSearchParams();
    if (key !== "all") params.set("status", key);
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  };

  return (
    <div style={{ display: "flex", gap: 4, padding: "10px 12px", borderBottom: "1px solid var(--admin-border)", overflowX: "auto" }}>
      {tabs.map((t) => {
        const active = (status || "all") === t.key;
        return (
          <a
            key={t.key}
            href={buildHref(t.key)}
            style={{
              padding: "8px 14px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              color: active ? "#fff" : "var(--admin-ink)",
              background: active ? "var(--admin-ink)" : "transparent",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            {t.label}
            {typeof t.count === "number" ? (
              <span style={{
                marginLeft: 8,
                padding: "1px 8px",
                borderRadius: 999,
                background: active ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.06)",
                fontSize: 11,
              }}>{t.count}</span>
            ) : null}
          </a>
        );
      })}
    </div>
  );
}
