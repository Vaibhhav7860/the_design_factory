import { adminRoute, requirePermission } from "@/lib/auth/permissions";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Order } from "@/lib/db/models";
import { textFilter } from "@/lib/pagination";
import { parseExportRange } from "@/lib/exportRange";
import { toCSV, csvResponse } from "@/lib/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_FILTERS = {
  unfulfilled: { fulfilmentStatus: "unfulfilled" },
  paid: { paymentStatus: "paid" },
  refunded: { paymentStatus: { $in: ["refunded", "partially_refunded"] } },
};

const COLUMNS = [
  { key: "orderNumber", header: "Order #" },
  { key: "createdAt", header: "Placed at" },
  { key: "customerName", header: "Customer" },
  { key: "customerEmail", header: "Email" },
  { key: "customerPhone", header: "Phone" },
  { key: "itemCount", header: "Items" },
  { key: "lineSummary", header: "Line items" },
  { key: "subtotalINR", header: "Subtotal (INR)" },
  { key: "shippingINR", header: "Shipping (INR)" },
  { key: "taxINR", header: "Tax (INR)" },
  { key: "discountINR", header: "Discount (INR)" },
  { key: "totalINR", header: "Total (INR)" },
  { key: "paymentStatus", header: "Payment status" },
  { key: "fulfilmentStatus", header: "Fulfilment status" },
  { key: "razorpayPaymentId", header: "Razorpay payment ID" },
  { key: "shippingCity", header: "Ship-to city" },
  { key: "shippingState", header: "Ship-to state" },
  { key: "shippingPostal", header: "Postal code" },
  { key: "currency", header: "Currency" },
];

function summariseLineItems(items = []) {
  return items
    .map((li) => `${li.productTitle || li.productSlug || "—"} ×${li.quantity}`)
    .join("; ");
}

export const GET = adminRoute(async (request) => {
  await requirePermission("orders.read");
  const url = new URL(request.url);
  const sp = Object.fromEntries(url.searchParams);
  const { skip, limit, q } = parseExportRange(sp);

  await connectToDatabase();

  const statusFilter = STATUS_FILTERS[sp.status] || {};
  const search = textFilter(q, [
    "orderNumber",
    "customerName",
    "customerEmail",
    "customerPhone",
  ]);
  const filter = search ? { ...statusFilter, ...search } : statusFilter;

  const docs = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const rows = docs.map((o) => ({
    orderNumber: o.orderNumber || "",
    createdAt: o.createdAt,
    customerName: o.customerName || "Guest",
    customerEmail: o.customerEmail || "",
    customerPhone: o.customerPhone || "",
    itemCount: (o.lineItems || []).reduce((sum, li) => sum + (li.quantity || 0), 0),
    lineSummary: summariseLineItems(o.lineItems),
    subtotalINR: ((o.subtotal ?? 0) / 100).toFixed(2),
    shippingINR: ((o.shipping ?? 0) / 100).toFixed(2),
    taxINR: ((o.tax ?? 0) / 100).toFixed(2),
    discountINR: ((o.discount ?? 0) / 100).toFixed(2),
    totalINR: ((o.total ?? 0) / 100).toFixed(2),
    paymentStatus: o.paymentStatus || "",
    fulfilmentStatus: o.fulfilmentStatus || "",
    razorpayPaymentId: o.razorpayPaymentId || "",
    shippingCity: o.shippingAddress?.city || "",
    shippingState: o.shippingAddress?.state || "",
    shippingPostal: o.shippingAddress?.postalCode || "",
    currency: o.currency || "INR",
  }));

  const csv = toCSV(COLUMNS, rows);
  return csvResponse(csv, "orders_export.csv");
});
