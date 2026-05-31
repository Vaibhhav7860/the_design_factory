import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { searchStorefront } from "@/lib/services/storefront-search";
import styles from "./search.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const sp = (await searchParams) || {};
  const q = String(sp.q || "").trim();
  return {
    title: q
      ? `Search results for “${q}” | The Design Factory`
      : "Search | The Design Factory",
  };
}

export default async function SearchPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const q = String(sp.q || "").trim();
  const data = q
    ? await searchStorefront(q, { limit: 60 })
    : { query: "", results: [], categoryResults: [], total: 0 };

  return (
    <section
      className={styles.page}
      style={{ marginTop: "var(--nav-height)" }}
    >
      <div className="container">
        <header className={styles.header}>
          <p className={styles.eyebrow}>Search</p>
          {q ? (
            <h1 className={styles.title}>
              Results for <em className={styles.query}>“{q}”</em>
            </h1>
          ) : (
            <h1 className={styles.title}>Find what you&apos;re looking for</h1>
          )}
          {q ? (
            <p className={styles.summary}>
              {data.total} {data.total === 1 ? "product" : "products"} found
            </p>
          ) : null}
        </header>

        {q && data.categoryResults?.length > 0 ? (
          <div className={styles.shortcuts}>
            <span className={styles.shortcutLabel}>Jump to</span>
            <ul className={styles.shortcutList}>
              {data.categoryResults.map((cat) => (
                <li key={cat.href}>
                  <Link href={cat.href} className={styles.shortcutChip}>
                    {cat.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {q && data.results.length > 0 ? (
          <div className={styles.grid}>
            {data.results.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  ...p,
                  // ProductCard expects `images` as an array; fall back
                  // gracefully if only `image` exists.
                  images: p.image ? [p.image] : [],
                }}
              />
            ))}
          </div>
        ) : null}

        {q && data.results.length === 0 ? (
          <div className={styles.empty}>
            <h2>No matches yet</h2>
            <p>
              We couldn&apos;t find anything for{" "}
              <em>&ldquo;{q}&rdquo;</em>. Try a broader keyword like
              &ldquo;bag&rdquo;, &ldquo;label&rdquo;, or &ldquo;gift
              tag&rdquo;.
            </p>
            <div className={styles.suggestionRow}>
              {[
                "Frozen",
                "Dinosaur",
                "Bag",
                "School Labels",
                "Money Envelopes",
                "Combos",
              ].map((s) => (
                <Link
                  key={s}
                  href={`/search?q=${encodeURIComponent(s)}`}
                  className={styles.suggestionChip}
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {!q ? (
          <div className={styles.empty}>
            <p>
              Use the magnifier in the top bar, or try one of these
              starting points.
            </p>
            <div className={styles.suggestionRow}>
              {[
                "Frozen",
                "Dinosaur",
                "Princess",
                "Bag",
                "School Labels",
                "Money Envelopes",
                "Combos",
                "Adults",
              ].map((s) => (
                <Link
                  key={s}
                  href={`/search?q=${encodeURIComponent(s)}`}
                  className={styles.suggestionChip}
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
