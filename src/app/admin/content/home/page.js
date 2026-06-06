import PageHeader from "@/components/admin/PageHeader";
import { Button } from "@/components/admin/Button";
import CarouselEditor from "./CarouselEditor";

export const metadata = { title: "Homepage Sections · Admin" };

export default function HomepageSectionsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Content · Homepage sections"
        title="Homepage Sections"
        description="Manage the hero carousel displayed at the top of your storefront."
        actions={
          <Button href="/admin/content" variant="secondary" size="sm">
            ← Back to Content
          </Button>
        }
      />
      <CarouselEditor />
    </div>
  );
}
