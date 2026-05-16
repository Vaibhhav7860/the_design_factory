import { categories, getCategoryBySlug } from "@/data/categories";
import { getProductsByCategory, products } from "@/data/products";
import ProductCard from "@/components/product/ProductCard";
import styles from "./category.module.css";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  return {
    title: cat
      ? `${cat.title} | The Design Factory`
      : "Collection | The Design Factory",
    description:
      cat?.description ||
      "Browse our curated collection of personalized gifts, labels, bags, and stationery.",
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  const catProducts = getProductsByCategory(slug);
  const displayProducts =
    catProducts.length > 0 ? catProducts : products.slice(0, 12);

  return (
    <section className={styles.page} style={{ marginTop: "var(--nav-height)" }}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <a href="/">Home</a>
          <span>/</span>
          <span>{category?.title || "Collection"}</span>
        </nav>

        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <h2>{category?.title || slug}</h2>
          {category?.description && <p>{category.description}</p>}
        </div>

        {/* Subcategory pills */}
        {category?.subcategories && (
          <div className={styles.pills}>
            <span className={`${styles.pill} ${styles.pillActive}`}>All</span>
            {category.subcategories.slice(0, 6).map((sub) => (
              <span key={sub.slug} className={styles.pill}>
                {sub.title}
              </span>
            ))}
          </div>
        )}

        {/* Product Grid */}
        <div className={styles.grid}>
          {displayProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
