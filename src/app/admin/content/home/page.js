import PageHeader from "@/components/admin/PageHeader";
import { Button } from "@/components/admin/Button";
import CarouselEditor from "./CarouselEditor";
import InstagramEditor from "./InstagramEditor";

export const metadata = { title: "Homepage Sections · Admin" };

export default function HomepageSectionsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Content · Homepage sections"
        title="Homepage Sections"
        description="Manage the hero carousel and Instagram community strip on your storefront."
        actions={
          <Button href="/admin/content" variant="secondary" size="sm">
            ← Back to Content
          </Button>
        }
      />
      <CarouselEditor />
      <div style={{ height: 24 }} />
      <InstagramEditor />
    </div>
  );
}
