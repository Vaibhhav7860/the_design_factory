import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Product, Order, Customer } from "@/lib/db/models";
import { requireSession, AuthError } from "@/lib/auth/permissions";
import { textFilter } from "@/lib/pagination";

const LIMIT_PER_TYPE = 5;

/**
 * Top-bar global search. Returns the top few matches per collection so the
 * dropdown can show categorised results and a "view all" link per section.
 *
 *   GET /api/admin/search?q=<query>
 */
export async function GET(request) {
  try {
    await requireSession();
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().slice(0, 200);

  const empty = {
    query: q,
    products: { results: [], total: 0 },
    orders: { results: [], total: 0 },
    customers: { results: [], total: 0 },
  };
  if (!q) return NextResponse.json(empty);

  await connectToDatabase();

  const productFilter = textFilter(q, ["title", "slug"]);
  const orderFilter = textFilter(q, [
    "orderNumber",
    "customerName",
    "customerEmail",
    "customerPhone",
  ]);
  const customerFilter = textFilter(q, ["name", "email", "phone"]);

  const [
    products,
    productCount,
    orders,
    orderCount,
    customers,
    customerCount,
  ] = await Promise.all([
    Product.find(productFilter)
      .select("title slug images price status categories")
      .sort({ updatedAt: -1 })
      .limit(LIMIT_PER_TYPE)
      .lean(),
    Product.countDocuments(productFilter),
    Order.find(orderFilter)
      .select(
        "orderNumber customerName customerEmail total paymentStatus fulfilmentStatus createdAt"
      )
      .sort({ createdAt: -1 })
      .limit(LIMIT_PER_TYPE)
      .lean(),
    Order.countDocuments(orderFilter),
    Customer.find(customerFilter)
      .select("name email phone totalOrders totalSpent")
      .sort({ totalSpent: -1 })
      .limit(LIMIT_PER_TYPE)
      .lean(),
    Customer.countDocuments(customerFilter),
  ]);

  return NextResponse.json({
    query: q,
    products: {
      total: productCount,
      results: products.map((p) => ({
        id: String(p._id),
        title: p.title,
        slug: p.slug,
        image: p.images?.[0] || null,
        price: p.price ?? 0,
        status: p.status,
        category: p.categories?.[0] || null,
      })),
    },
    orders: {
      total: orderCount,
      results: orders.map((o) => ({
        id: String(o._id),
        orderNumber: o.orderNumber,
        customerName: o.customerName || "Guest",
        customerEmail: o.customerEmail || null,
        total: o.total ?? 0,
        paymentStatus: o.paymentStatus,
        fulfilmentStatus: o.fulfilmentStatus,
        createdAt: o.createdAt,
      })),
    },
    customers: {
      total: customerCount,
      results: customers.map((c) => ({
        id: String(c._id),
        name: c.name || "—",
        email: c.email,
        phone: c.phone || null,
        totalOrders: c.totalOrders || 0,
        totalSpent: c.totalSpent || 0,
      })),
    },
  });
}
