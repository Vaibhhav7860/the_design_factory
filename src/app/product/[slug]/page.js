import { products, getProductBySlug, getRelatedProducts } from "@/data/products";
import ProductDetail from "./ProductDetail";
import ProductCard from "@/components/product/ProductCard";
import styles from "./product.module.css";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  return {
    title: product ? `${product.title} | The Design Factory` : "Product | The Design Factory",
    description: product?.description || "Premium personalized product",
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug) || products[0];
  const related = getRelatedProducts(product.slug, 4);

  return (
    <section className={styles.page} style={{ marginTop: "var(--nav-height)" }}>
      <div className="container">
        <nav className={styles.breadcrumb}>
          <a href="/">Home</a>
          <span>/</span>
          <a href={`/category/${product.category}`}>{product.category}</a>
          <span>/</span>
          <span>{product.title}</span>
        </nav>

        <ProductDetail product={product} />

        {related.length > 0 && (
          <div className={styles.related}>
            <div className={styles.relatedHeader}>
              <h2>You May Also Like</h2>
            </div>
            <div className={styles.relatedGrid}>
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
