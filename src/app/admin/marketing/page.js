import PageHeader from "@/components/admin/PageHeader";
import { Card, CardHeader, EmptyState } from "@/components/admin/Card";
import { Button } from "@/components/admin/Button";
import { HiOutlineSpeakerphone, HiOutlineMail, HiOutlineCog, HiOutlineInbox, HiOutlinePlus } from "react-icons/hi";
import Link from "next/link";

export const metadata = { title: "Marketing · Admin" };

export default function MarketingPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Reach customers"
        title="Marketing"
        description="Plan and run campaigns, automate retention, and grow your subscriber list."
        actions={<Button variant="primary" iconLeft={<HiOutlinePlus />}>New campaign</Button>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <Card>
          <CardHeader title="Email campaigns" subtitle="Schedule promos, restocks and announcements." />
          <EmptyState
            icon={<HiOutlineMail />}
            title="No campaigns yet"
            description="Create your first email campaign to engage customers."
            action={<Button variant="primary" iconLeft={<HiOutlinePlus />}>New campaign</Button>}
          />
        </Card>

        <Card>
          <CardHeader title="Automations" subtitle="Abandoned cart, post-purchase, win-back." />
          <EmptyState
            icon={<HiOutlineCog />}
            title="No automations yet"
            description="Configure abandoned-cart recovery and other lifecycle journeys."
          />
        </Card>

        <Card>
          <CardHeader
            title="Newsletter subscribers"
            actions={<Link href="/admin/marketing/newsletter" style={{ fontSize: 13, fontWeight: 600 }}>Open</Link>}
          />
          <p style={{ fontSize: 14, color: "var(--admin-ink-muted)", margin: 0 }}>
            Manage opt-ins captured from the storefront newsletter form. Export to CSV.
          </p>
        </Card>

        <Card>
          <CardHeader
            title="Bulk-orders inbox"
            actions={<Link href="/admin/marketing/bulk-enquiries" style={{ fontSize: 13, fontWeight: 600 }}>Open</Link>}
          />
          <p style={{ fontSize: 14, color: "var(--admin-ink-muted)", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <HiOutlineInbox /> Triage incoming bulk-order requests from the storefront form.
          </p>
        </Card>
      </div>
    </div>
  );
}
