import PageHeader from "@/components/admin/PageHeader";
import { Card, CardHeader, EmptyState } from "@/components/admin/Card";
import { Button } from "@/components/admin/Button";
import { HiOutlineChartBar, HiOutlineDownload } from "react-icons/hi";

export const metadata = { title: "Analytics · Admin" };

const REPORTS = [
  { title: "Sales over time", description: "Day-by-day revenue and order volume." },
  { title: "Sales by product", description: "Best-sellers and slow-movers." },
  { title: "Sales by category", description: "Which collections drive revenue." },
  { title: "Sales by discount", description: "Coupon performance and ROI." },
  { title: "New vs returning", description: "Acquisition vs retention split." },
  { title: "Average order value", description: "AOV trend over time." },
  { title: "Conversion funnel", description: "Sessions → carts → orders." },
];

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Performance"
        title="Analytics"
        description="Sales, traffic and customer reports — exportable to CSV."
        actions={<Button variant="secondary" iconLeft={<HiOutlineDownload />}>Export all</Button>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {REPORTS.map((r) => (
          <Card key={r.title}>
            <CardHeader title={r.title} subtitle={r.description} />
            <EmptyState
              icon={<HiOutlineChartBar />}
              title="No data yet"
              description="Once orders start coming in, this report will populate."
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
