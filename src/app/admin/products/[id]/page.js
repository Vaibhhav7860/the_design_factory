import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import ProductForm from "@/components/admin/ProductForm";
import { Button } from "@/components/admin/Button";
import { CATEGORIES, TAG_COLORS } from "@/lib/data/categories-taxonomy";
import { getProductById } from "@/lib/services/products";
import { HiOutlineArrowLeft, HiOutlineExternalLink } from "react-icons/hi";

export const metadata = { title: "Edit product · Admin" };

// Always fetch fresh — admin edit screen
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title={product.title || "Edit product"}
        description="Edit any field below and click Update product to save changes."
        actions={
          <>
            <Button
              variant="ghost"
              href="/admin/products"
              iconLeft={<HiOutlineArrowLeft />}
            >
              Back to products
            </Button>
            <Button
              variant="secondary"
              href={`/product/${product.slug}`}
              iconLeft={<HiOutlineExternalLink />}
            >
              View on storefront
            </Button>
          </>
        }
      />
      <ProductForm
        mode="edit"
        initial={product}
        categories={CATEGORIES}
        tagColors={TAG_COLORS}
      />
    </div>
  );
}
