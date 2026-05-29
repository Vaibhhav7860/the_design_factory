import { connectToDatabase } from "../db/mongoose.js";
import { Order, Customer, Product, BulkEnquiry } from "../db/models/index.js";
import { formatINR } from "../format.js";
import { previousPeriodOf, describePreviousPeriod } from "../dateRange.js";

/**
 * Returns a dashboard snapshot for the given period.
 * Falls back to an empty-state snapshot when the DB is unreachable so the
 * page never crashes for a fresh installation.
 *
 * @param {{ from: Date, to: Date }} window
 */
export async function getDashboardSnapshot(window) {
  const empty = emptySnapshot();
  if (!window?.from || !window?.to) return empty;

  try {
    await connectToDatabase();
  } catch {
    return empty;
  }

  const { from, to } = window;
  const previous = previousPeriodOf(window);
  const periodCaption = describePreviousPeriod(window);

  const [
    salesAggCurrent,
    salesAggPrev,
    ordersCountCurrent,
    ordersCountPrev,
    newCustomersCurrent,
    newCustomersPrev,
    unfulfilledOrders,
    bulkEnquiries,
    lowStockVariants,
    recentOrdersDocs,
    topProductsAgg,
  ] = await Promise.all([
    aggregateSales(from, to),
    aggregateSales(previous.from, previous.to),
    Order.countDocuments({ createdAt: { $gte: from, $lte: to }, paymentStatus: "paid" }),
    Order.countDocuments({
      createdAt: { $gte: previous.from, $lte: previous.to },
      paymentStatus: "paid",
    }),
    Customer.countDocuments({ createdAt: { $gte: from, $lte: to } }),
    Customer.countDocuments({ createdAt: { $gte: previous.from, $lte: previous.to } }),
    Order.countDocuments({ fulfilmentStatus: "unfulfilled", paymentStatus: "paid" }),
    BulkEnquiry.countDocuments({ status: "new" }),
    countLowStockVariants(),
    Order.find({ createdAt: { $gte: from, $lte: to } })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("orderNumber customerName total paymentStatus fulfilmentStatus createdAt")
      .lean(),
    aggregateTopProducts(from, to),
  ]);

  const sales = makeStat({
    current: salesAggCurrent,
    previous: salesAggPrev,
    formatter: formatINR,
    caption: periodCaption,
  });

  const orders = makeStat({
    current: ordersCountCurrent,
    previous: ordersCountPrev,
    caption: periodCaption,
  });

  const newCustomers = makeStat({
    current: newCustomersCurrent,
    previous: newCustomersPrev,
    caption: periodCaption,
  });

  // Conversion rate proxy until we wire real session tracking
  const sessionsProxy = newCustomersCurrent || ordersCountCurrent || 1;
  const conversionPercent =
    ordersCountCurrent > 0 ? (ordersCountCurrent / sessionsProxy) * 100 : 0;

  return {
    sales,
    orders,
    newCustomers,
    conversionRate: {
      value: `${conversionPercent.toFixed(1)}%`,
      change: null,
      tone: "neutral",
    },
    unfulfilledOrders,
    bulkEnquiries,
    lowStockVariants,
    recentOrders: recentOrdersDocs.map((o) => ({
      id: String(o._id),
      orderNumber: o.orderNumber || "—",
      customerName: o.customerName || "Guest",
      paymentStatus: o.paymentStatus || "pending",
      fulfilmentStatus: o.fulfilmentStatus || "unfulfilled",
      totalDisplay: formatINR(o.total ?? 0),
      createdAt: o.createdAt,
    })),
    topProducts: topProductsAgg.map((p) => ({
      id: String(p._id),
      title: p.title,
      unitsSold: p.unitsSold,
      revenueDisplay: formatINR(p.revenue ?? 0),
    })),
  };
}

async function aggregateSales(from, to) {
  const result = await Order.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to }, paymentStatus: "paid" } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);
  return result[0]?.total ?? 0;
}

async function aggregateTopProducts(from, to) {
  const result = await Order.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to }, paymentStatus: "paid" } },
    { $unwind: "$lineItems" },
    {
      $group: {
        _id: "$lineItems.productId",
        title: { $first: "$lineItems.productTitle" },
        unitsSold: { $sum: "$lineItems.quantity" },
        revenue: { $sum: { $multiply: ["$lineItems.price", "$lineItems.quantity"] } },
      },
    },
    { $sort: { unitsSold: -1 } },
    { $limit: 5 },
  ]);
  return result;
}

async function countLowStockVariants() {
  const result = await Product.aggregate([
    { $match: { status: "active" } },
    { $unwind: "$variants" },
    {
      $match: {
        $expr: { $lte: ["$variants.inventory", "$variants.lowStockThreshold"] },
      },
    },
    { $count: "n" },
  ]);
  return result[0]?.n ?? 0;
}

function makeStat({ current, previous, formatter = (v) => String(v), caption = "vs previous" }) {
  let change = null;
  let tone = "neutral";
  if (previous > 0) {
    const delta = ((current - previous) / previous) * 100;
    change = `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}% ${caption}`;
    tone = delta > 0 ? "positive" : delta < 0 ? "negative" : "neutral";
  } else if (current > 0) {
    change = `New activity ${caption}`;
    tone = "positive";
  } else {
    change = `No activity ${caption}`;
    tone = "neutral";
  }
  return {
    value: formatter(current),
    change,
    tone,
  };
}

function emptySnapshot() {
  return {
    sales: { value: formatINR(0), change: null, tone: "neutral" },
    orders: { value: "0", change: null, tone: "neutral" },
    newCustomers: { value: "0", change: null, tone: "neutral" },
    conversionRate: { value: "0%", change: null, tone: "neutral" },
    unfulfilledOrders: 0,
    bulkEnquiries: 0,
    lowStockVariants: 0,
    recentOrders: [],
    topProducts: [],
  };
}
