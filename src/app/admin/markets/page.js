import PageHeader from "@/components/admin/PageHeader";
import { Card, CardHeader, EmptyState } from "@/components/admin/Card";
import { Button } from "@/components/admin/Button";
import { HiOutlineGlobe, HiOutlinePlus } from "react-icons/hi";

export const metadata = { title: "Markets · Admin" };

export default function MarketsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Where you sell"
        title="Markets"
        description="Manage countries you ship to, currencies, languages and pricing rules per market."
        actions={<Button variant="primary" iconLeft={<HiOutlinePlus />}>Add market</Button>}
      />

      <Card>
        <CardHeader title="Primary market" subtitle="Single-store v1 ships INR + English to India only." />
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16, alignItems: "center", padding: "8px 0" }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: "linear-gradient(135deg, #FCD589, #FBC9BC)",
            display: "grid", placeItems: "center", fontSize: 22,
          }}>🇮🇳</div>
          <div>
            <div style={{ fontWeight: 600 }}>India</div>
            <div style={{ fontSize: 13, color: "var(--admin-ink-muted)" }}>
              INR · English · Razorpay (prepaid only)
            </div>
          </div>
          <Button variant="secondary" size="sm">Edit</Button>
        </div>
      </Card>

      <div style={{ marginTop: 16 }}>
        <Card>
          <EmptyState
            icon={<HiOutlineGlobe />}
            title="No additional markets"
            description="Multi-currency and multi-language are deferred for v1. Reach out when you're ready to expand."
          />
        </Card>
      </div>
    </div>
  );
}
