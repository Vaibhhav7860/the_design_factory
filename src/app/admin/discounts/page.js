import PageHeader from "@/components/admin/PageHeader";
import { Card, EmptyState } from "@/components/admin/Card";
import { Button } from "@/components/admin/Button";
import DataTable, { StatusPill } from "@/components/admin/DataTable";
import { HiOutlineGift, HiOutlinePlus } from "react-icons/hi";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Discount } from "@/lib/db/models";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Discounts · Admin" };

export default async function DiscountsPage() {
  let discounts = [];
  try {
    await connectToDatabase();
    discounts = await Discount.find({ isArchived: false }).sort({ createdAt: -1 }).limit(50).lean();
  } catch {}

  return (
    <div>
      <PageHeader
        eyebrow="Promotions"
        title="Discounts"
        description="Create coupon codes, automatic discounts, BOGO and free-shipping rules."
        actions={<Button variant="primary" iconLeft={<HiOutlinePlus />}>Create discount</Button>}
      />

      <Card padded={false}>
        {discounts.length ? (
          <DataTable
            columns={[
              { key: "name", header: "Name" },
              { key: "type", header: "Type", render: (d) => d.type.replace("_", " ") },
              { key: "code", header: "Code", render: (d) => d.coupons?.[0]?.code || "—" },
              { key: "usedCount", header: "Used", align: "right" },
              { key: "endsAt", header: "Ends", render: (d) => formatDate(d.endsAt) },
              {
                key: "status",
                header: "Status",
                render: (d) => {
                  const expired = d.endsAt && new Date(d.endsAt) < new Date();
                  return (
                    <StatusPill tone={expired ? "neutral" : d.isActive ? "positive" : "warning"}>
                      {expired ? "Expired" : d.isActive ? "Active" : "Inactive"}
                    </StatusPill>
                  );
                },
              },
            ]}
            rows={discounts.map((d) => ({ ...d, id: String(d._id) }))}
          />
        ) : (
          <EmptyState
            icon={<HiOutlineGift />}
            title="No discounts yet"
            description="Create your first percentage, fixed-amount or free-shipping discount."
            action={<Button variant="primary" iconLeft={<HiOutlinePlus />}>Create discount</Button>}
          />
        )}
      </Card>
    </div>
  );
}
