import PageHeader from "@/components/admin/PageHeader";
import ProductForm from "@/components/admin/ProductForm";
import { CATEGORIES, TAG_COLORS } from "@/lib/data/categories-taxonomy";

export const metadata = { title: "Add product · Admin" };

export default function NewProductPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Add product"
        description="Upload images, set pricing, pick categories and tags. The product is saved to MongoDB on submit."
      />
      <ProductForm
        mode="create"
        categories={CATEGORIES}
        tagColors={TAG_COLORS}
      />
    </div>
  );
}
