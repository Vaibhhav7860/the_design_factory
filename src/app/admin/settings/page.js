import PageHeader from "@/components/admin/PageHeader";
import { Card } from "@/components/admin/Card";
import Link from "next/link";
import {
  HiOutlineCog,
  HiOutlineCreditCard,
  HiOutlineTruck,
  HiOutlineCalculator,
  HiOutlineUserGroup,
  HiOutlineMail,
  HiOutlineShieldCheck,
  HiOutlineCube,
  HiOutlineDocumentSearch,
} from "react-icons/hi";

export const metadata = { title: "Settings · Admin" };

const TILES = [
  { href: "/admin/settings/general", title: "General", description: "Store name, contact, address.", Icon: HiOutlineCog },
  { href: "/admin/settings/payments", title: "Payments", description: "Razorpay configuration (prepaid only).", Icon: HiOutlineCreditCard },
  { href: "/admin/settings/shipping", title: "Shipping & delivery", description: "Zones, rates, carriers.", Icon: HiOutlineTruck },
  { href: "/admin/settings/taxes", title: "Taxes", description: "Tax rates by category.", Icon: HiOutlineCalculator },
  { href: "/admin/settings/staff", title: "Staff & permissions", description: "Invite users, scope access.", Icon: HiOutlineUserGroup },
  { href: "/admin/settings/notifications", title: "Notifications", description: "Email templates for transactions.", Icon: HiOutlineMail },
  { href: "/admin/settings/apps", title: "Apps & integrations", description: "Razorpay, GA4, Meta Pixel.", Icon: HiOutlineCube },
  { href: "/admin/settings/audit-log", title: "Audit log", description: "Every admin write, traced.", Icon: HiOutlineDocumentSearch },
  { href: "/admin/settings/security", title: "Security", description: "MFA, sessions, active devices.", Icon: HiOutlineShieldCheck },
];

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Store-wide configuration, integrations, and team access."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {TILES.map(({ href, title, description, Icon }) => (
          <Link key={href} href={href} style={{ textDecoration: "none", color: "inherit" }}>
            <Card>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "var(--admin-surface-elevated)",
                  border: "1px solid var(--admin-border)",
                  display: "grid", placeItems: "center",
                  fontSize: 20, color: "var(--admin-ink)",
                  flexShrink: 0,
                }}>
                  <Icon />
                </div>
                <div>
                  <h3 style={{
                    fontFamily: "var(--admin-font-display)",
                    fontSize: 18, fontWeight: 600, margin: 0, lineHeight: 1.2,
                  }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--admin-ink-muted)", margin: "6px 0 0", lineHeight: 1.5 }}>
                    {description}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
