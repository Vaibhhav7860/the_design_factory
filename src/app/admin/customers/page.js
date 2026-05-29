import PageHeader from "@/components/admin/PageHeader";
import { Card, EmptyState } from "@/components/admin/Card";
import DataTable from "@/components/admin/DataTable";
import ListToolbar from "@/components/admin/ListToolbar";
import Pagination from "@/components/admin/Pagination";
import ExportButton from "@/components/admin/ExportButton";
import { HiOutlineUser } from "react-icons/hi";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Customer } from "@/lib/db/models";
import { formatINR, formatDate } from "@/lib/format";
import { parsePagination, textFilter } from "@/lib/pagination";

export const metadata = { title: "Customers · Admin" };

export default async function CustomersPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const { q, page, perPage, skip, limit } = parsePagination(sp);

  let customers = [];
  let total = 0;
  let matchedTotal = 0;

  try {
    await connectToDatabase();

    const filter = textFilter(q, ["name", "email", "phone"]) ?? {};

    [customers, matchedTotal, total] = await Promise.all([
      Customer.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Customer.countDocuments(filter),
      q ? Customer.estimatedDocumentCount() : Promise.resolve(null),
    ]);
    if (total === null) total = matchedTotal;
  } catch {}

  return (
    <div>
      <PageHeader
        eyebrow="Customer base"
        title="Customers"
        description="View customer profiles, lifetime value, segments and order history."
        actions={
          <ExportButton
            resource="customers"
            filename="customers_export.csv"
            apiPath="/api/admin/customers/export"
            total={total}
            matchedTotal={matchedTotal}
            currentPage={page}
            currentPerPage={perPage}
            currentQuery={q}
          />
        }
      />

      <Card padded={false}>
        <ListToolbar
          placeholder="Search customers by name, email or phone"
          total={total}
          matchedTotal={matchedTotal}
          label="customers"
        />

        {customers.length ? (
          <>
            <DataTable
              columns={[
                { key: "name", header: "Name", render: (c) => c.name || "—" },
                { key: "email", header: "Email" },
                { key: "totalOrders", header: "Orders", align: "right", render: (c) => c.totalOrders || 0 },
                { key: "totalSpent", header: "Lifetime spend", align: "right", render: (c) => formatINR(c.totalSpent ?? 0) },
                { key: "lastOrderAt", header: "Last order", render: (c) => formatDate(c.lastOrderAt) },
              ]}
              rows={customers.map((c) => ({ ...c, id: String(c._id) }))}
            />
            <Pagination
              total={matchedTotal}
              page={page}
              perPage={perPage}
              label="customers"
            />
          </>
        ) : q ? (
          <EmptyState
            icon={<HiOutlineUser />}
            title={`No customers match "${q}"`}
            description="Try a different name, email or phone number."
          />
        ) : (
          <EmptyState
            icon={<HiOutlineUser />}
            title="No customers yet"
            description="Customer profiles are auto-created when an order is placed or someone signs up at checkout."
          />
        )}
      </Card>
    </div>
  );
}
