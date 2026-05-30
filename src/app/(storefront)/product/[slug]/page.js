import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/services/storefront-products";
import ProductDetail from "./ProductDetail";
import RelatedProductsSlider from "./RelatedProductsSlider";
import styles from "./product.module.css";
import Link from "next/link";

// Re-fetch on every request so admin edits show immediately. We can
// switch to ISR with revalidateTag later if traffic warrants it.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product
      ? `${product.title} | The Design Factory`
      : "Product | The Design Factory",
    description: product?.description || "Premium personalized product",
  };
}

export default async function ProductPage({ params }) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      notFound();
    }
    
    const product = await getProductBySlug(slug);
    
    if (!product) {
      notFound();
    }

    const related = await getRelatedProducts(product.slug, 10);

    return (
      <section className={styles.page} style={{ marginTop: "var(--nav-height)" }}>
        <div className="container">
          <nav className={styles.breadcrumb}>
            <Link href="/" className={styles.breadcrumbLink}>
              Home
            </Link>
            <span>/</span>
            <Link href={`/category/${product.categories?.[0] || "labels"}`}>
              {product.categories?.[0]?.replace(/-/g, " ") || "Labels"}
            </Link>
            <span>/</span>
            <span>{product.title}</span>
          </nav>

          <ProductDetail product={product} />

          {related.length > 0 && (
            <div className={styles.related}>
              <div className={styles.relatedHeader}>
                <h2>You May Also Like</h2>
              </div>
              <RelatedProductsSlider products={related} />
            </div>
          )}
        </div>
      </section>
    );
  } catch (error) {
    console.error('Error loading product page:', error);
    notFound();
  }
}
