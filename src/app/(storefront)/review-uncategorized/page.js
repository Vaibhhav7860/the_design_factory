import { products } from "@/data/products";
import ProductCard from "@/components/product/ProductCard";
import styles from "./review.module.css";

export default function ReviewUncategorizedPage() {
  // Get all uncategorized products
  const uncategorizedProducts = products.filter(p => p.category === 'uncategorized');

  return (
    <section className={styles.page} style={{ marginTop: "var(--nav-height)" }}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <h1>Review Uncategorized Products</h1>
          <p>Total uncategorized products: <strong>{uncategorizedProducts.length}</strong></p>
          <p className={styles.note}>
            📝 Review these products and provide categorization instructions. 
            This page will be deleted after categorization is complete.
          </p>
        </div>

        {/* Products Grid */}
        <div className={styles.grid}>
          {uncategorizedProducts.map((product, index) => (
            <div key={product.slug} className={styles.productWrapper}>
              <div className={styles.productNumber}>#{index + 1}</div>
              <ProductCard product={product} />
              <div className={styles.productInfo}>
                <p className={styles.handle}><strong>Handle:</strong> {product.handle}</p>
                <p className={styles.description}>
                  <strong>Description:</strong> {product.description?.substring(0, 100)}...
                </p>
              </div>
            </div>
          ))}
        </div>

        {uncategorizedProducts.length === 0 && (
          <div className={styles.noProducts}>
            <p>🎉 All products have been categorized!</p>
          </div>
        )}
      </div>
    </section>
  );
}