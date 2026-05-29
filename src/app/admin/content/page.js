import PageHeader from "@/components/admin/PageHeader";
import { Card, CardHeader } from "@/components/admin/Card";
import Link from "next/link";
import {
  HiOutlinePhotograph,
  HiOutlineTemplate,
  HiOutlineDocumentText,
  HiOutlineMenu,
  HiOutlineColorSwatch,
  HiOutlineFolder,
} from "react-icons/hi";

export const metadata = { title: "Content · Admin" };

const TILES = [
  {
    href: "/admin/content/home",
    title: "Homepage sections",
    description: "Hero, banners, season's picks, testimonials and more.",
    Icon: HiOutlineTemplate,
  },
  {
    href: "/admin/content/pages",
    title: "Pages",
    description: "About, FAQ, Privacy, Terms and any custom landing page.",
    Icon: HiOutlineDocumentText,
  },
  {
    href: "/admin/content/navigation",
    title: "Navigation",
    description: "Header mega-menu and footer link groups.",
    Icon: HiOutlineMenu,
  },
  {
    href: "/admin/content/theme",
    title: "Theme & branding",
    description: "Brand colours, typography pairings, section visibility.",
    Icon: HiOutlineColorSwatch,
  },
  {
    href: "/admin/content/blog",
    title: "Blog posts",
    description: "Articles, journals, behind-the-scenes stories.",
    Icon: HiOutlineDocumentText,
  },
  {
    href: "/admin/content/files",
    title: "Files & assets",
    description: "Image and video library — uploads, references, cleanup.",
    Icon: HiOutlineFolder,
  },
];

export default function ContentHubPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Storefront content"
        title="Content"
        description="Edit homepage sections, standalone pages, navigation, theme and the asset library."
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
