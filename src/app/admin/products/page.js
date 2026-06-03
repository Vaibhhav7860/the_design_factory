import PageHeader from "@/components/admin/PageHeader";
import { Card, EmptyState } from "@/components/admin/Card";
import { Button } from "@/components/admin/Button";
import DataTable, { StatusPill } from "@/components/admin/DataTable";
import ListToolbar from "@/components/admin/ListToolbar";
import Pagination from "@/components/admin/Pagination";
import ExportButton from "@/components/admin/ExportButton";
import GlobalDiscountButton from "@/components/admin/GlobalDiscountButton";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import { HiOutlineTag, HiOutlinePlus } from "react-icons/hi";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Product } from "@/lib/db/models";
import { formatINR } from "@/lib/format";
import { parsePagination, textFilter } from "@/lib/pagination";

export const metadata = { title: "Products · Admin" };

export default async function ProductsPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const { q, page, perPage, skip, limit } = parsePagination(sp);
  const subcategory = sp.subcategory || null;
  const sortParam = sp.sort || "relevant";

  let products = [];
  let total = 0;
  let matchedTotal = 0;

  try {
    await connectToDatabase();

    const filter = textFilter(q, ["title", "slug"]) ?? {};
    if (subcategory) {
      filter.subcategories = subcategory;
    }

    let sortObj = { updatedAt: -1 };
    switch (sortParam) {
      case "best_selling":
        sortObj = { salesCount: -1 };
        break;
      case "title_asc":
        sortObj = { title: 1 };
        break;
      case "title_desc":
        sortObj = { title: -1 };
        break;
      case "price_desc":
        sortObj = { price: -1 };
        break;
      case "price_asc":
        sortObj = { price: 1 };
        break;
      case "newest":
        sortObj = { createdAt: -1 };
        break;
      case "oldest":
        sortObj = { createdAt: 1 };
        break;
      case "relevant":
      default:
        // Text search automatically sorts by score if q is present, else fallback
        if (q) {
           sortObj = { score: { $meta: "textScore" } };
        } else {
           sortObj = { updatedAt: -1 };
        }
        break;
    }

    let query = Product.find(filter);
    if (q && sortParam === "relevant") {
       query = query.select({ score: { $meta: "textScore" } }).sort(sortObj);
    } else {
       query = query.sort(sortObj);
    }

    [products, matchedTotal, total] = await Promise.all([
      query
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
      (q || subcategory) ? Product.estimatedDocumentCount() : Promise.resolve(null),
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
            <GlobalDiscountButton />
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
          activeSubcategory={subcategory}
          currentSort={sortParam}
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
                {
                  key: "actions",
                  header: "",
                  align: "right",
                  render: (p) => (
                    <DeleteProductButton id={p.id} title={p.title} />
                  ),
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
