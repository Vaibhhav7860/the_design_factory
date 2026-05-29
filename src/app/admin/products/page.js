import PageHeader from "@/components/admin/PageHeader";
import { Card, EmptyState } from "@/components/admin/Card";
import { Button } from "@/components/admin/Button";
import DataTable, { StatusPill } from "@/components/admin/DataTable";
import ListToolbar from "@/components/admin/ListToolbar";
import Pagination from "@/components/admin/Pagination";
import ExportButton from "@/components/admin/ExportButton";
import { HiOutlineTag, HiOutlinePlus } from "react-icons/hi";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Product } from "@/lib/db/models";
import { formatINR } from "@/lib/format";
import { parsePagination, textFilter } from "@/lib/pagination";

export const metadata = { title: "Products · Admin" };

export default async function ProductsPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const { q, page, perPage, skip, limit } = parsePagination(sp);

  let products = [];
  let total = 0;
  let matchedTotal = 0;

  try {
    await connectToDatabase();

    const filter = textFilter(q, ["title", "slug"]) ?? {};

    [products, matchedTotal, total] = await Promise.all([
      Product.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
      q ? Product.estimatedDocumentCount() : Promise.resolve(null),
    ]);
    if (total === null) total = matchedTotal;
  } catch {
    // empty fallback
  }

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Products"
        description="Manage your products, variants, inventory and personalisation rules."
        actions={
          <>
            <ExportButton
              resource="products"
              filename="products_Export.csv"
              apiPath="/api/admin/products/export"
              total={total}
              matchedTotal={matchedTotal}
              currentPage={page}
              currentPerPage={perPage}
              currentQuery={q}
            />
            <Button variant="primary" iconLeft={<HiOutlinePlus />} href="/admin/products/new">
              Add product
            </Button>
          </>
        }
      />

      <Card padded={false}>
        <ListToolbar
          placeholder="Search products by title or slug"
          total={total}
          matchedTotal={matchedTotal}
          label="products"
        />

        {products.length ? (
          <>
            <DataTable
              columns={[
                {
                  key: "title",
                  header: "Title",
                  render: (p) => (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {p.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.images[0]}
                          alt=""
                          style={{
                            width: 40, height: 40, borderRadius: 6, objectFit: "cover",
                            background: "var(--admin-surface-elevated)",
                            border: "1px solid var(--admin-border)",
                          }}
                        />
                      ) : (
                        <div style={{
                          width: 40, height: 40, borderRadius: 6,
                          background: "var(--admin-surface-elevated)",
                          border: "1px solid var(--admin-border)",
                        }} />
                      )}
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.title}</div>
                        <div style={{ fontSize: 12, color: "var(--admin-ink-muted)" }}>{p.slug}</div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  render: (p) => (
                    <StatusPill tone={p.status === "active" ? "positive" : p.status === "draft" ? "warning" : "neutral"}>
                      {p.status}
                    </StatusPill>
                  ),
                },
                { key: "category", header: "Category", render: (p) => (p.categories?.[0] || "—") },
                {
                  key: "inventory",
                  header: "Inventory",
                  align: "right",
                  render: (p) => {
                    const totalStock = (p.variants || []).reduce((s, v) => s + (v.inventory || 0), 0);
                    return totalStock > 0
                      ? `${totalStock} in stock`
                      : <span style={{ color: "var(--admin-warning)" }}>Out of stock</span>;
                  },
                },
                {
                  key: "price",
                  header: "Price",
                  align: "right",
                  render: (p) => formatINR(p.price ?? 0),
                },
              ]}
              rows={products.map((p) => ({ ...p, id: String(p._id) }))}
              rowHref={(row) => `/admin/products/${row.id}`}
            />
            <Pagination
              total={matchedTotal}
              page={page}
              perPage={perPage}
              label="products"
            />
          </>
        ) : q ? (
          <EmptyState
            icon={<HiOutlineTag />}
            title={`No products match "${q}"`}
            description="Try a different keyword, or clear the search to see all products."
          />
        ) : (
          <EmptyState
            icon={<HiOutlineTag />}
            title="No products yet"
            description="Add your first product or run the seed script to import from processed_products.json."
            action={
              <Button variant="primary" href="/admin/products/new" iconLeft={<HiOutlinePlus />}>
                Add product
              </Button>
            }
          />
        )}
      </Card>
    </div>
  );
}
