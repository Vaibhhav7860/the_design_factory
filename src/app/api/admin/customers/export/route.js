import { adminRoute, requirePermission } from "@/lib/auth/permissions";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Customer } from "@/lib/db/models";
import { textFilter } from "@/lib/pagination";
import { parseExportRange } from "@/lib/exportRange";
import { toCSV, csvResponse } from "@/lib/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLUMNS = [
  { key: "id", header: "Customer ID" },
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "phone", header: "Phone" },
  { key: "totalOrders", header: "Orders" },
  { key: "totalSpentINR", header: "Lifetime spend (INR)" },
  { key: "lastOrderAt", header: "Last order" },
  { key: "tags", header: "Tags", format: (v) => (v || []).join("; ") },
  { key: "acceptsMarketing", header: "Accepts marketing" },
  { key: "addressCity", header: "Default city" },
  { key: "addressState", header: "Default state" },
  { key: "addressPostal", header: "Postal code" },
  { key: "createdAt", header: "Joined" },
];

function defaultAddress(addresses = []) {
  return addresses.find((a) => a.isDefault) || addresses[0] || {};
}

export const GET = adminRoute(async (request) => {
  await requirePermission("customers.read");
  const url = new URL(request.url);
  const sp = Object.fromEntries(url.searchParams);
  const { skip, limit, q } = parseExportRange(sp);

  await connectToDatabase();

  const filter = textFilter(q, ["name", "email", "phone"]) ?? {};
  const docs = await Customer.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const rows = docs.map((c) => {
    const addr = defaultAddress(c.addresses);
    return {
      id: String(c._id),
      name: c.name || "",
      email: c.email || "",
      phone: c.phone || "",
      totalOrders: c.totalOrders || 0,
      totalSpentINR: ((c.totalSpent ?? 0) / 100).toFixed(2),
      lastOrderAt: c.lastOrderAt || "",
      tags: c.tags || [],
      acceptsMarketing: c.acceptsMarketing ? "Yes" : "No",
      addressCity: addr.city || "",
      addressState: addr.state || "",
      addressPostal: addr.postalCode || "",
      createdAt: c.createdAt,
    };
  });

  const csv = toCSV(COLUMNS, rows);
  return csvResponse(csv, "customers_export.csv");
});
