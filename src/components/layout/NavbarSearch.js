"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import styles from "./NavbarSearch.module.css";

const MIN_QUERY = 2;
const DEBOUNCE_MS = 180;

const EMPTY = {
  query: "",
  productResults: [],
  categoryResults: [],
  total: 0,
};

/**
 * Storefront search overlay triggered by the navbar magnifier.
 *
 * - Click the magnifier (or press `/`) → modal opens.
 * - Type → debounced fetch to /api/search/suggest.
 * - Up/Down/Enter to navigate results; Esc closes.
 * - Enter on an empty selection routes to /search?q=<query> for the
 *   full results page.
 */
export default function NavbarSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  const trimmed = value.trim();
  const showResults = trimmed.length >= MIN_QUERY;
  const hasAnyResults =
    data.productResults.length + data.categoryResults.length > 0;

  // Flat list for keyboard navigation (categories first, then products)
  const flatItems = useMemo(() => {
    const out = [];
    data.categoryResults.forEach((c) =>
      out.push({ kind: "category", href: c.href, item: c })
    );
    data.productResults.forEach((p) =>
      out.push({ kind: "product", href: `/product/${p.slug}`, item: p })
    );
    return out;
  }, [data]);

  // Open / close lifecycle
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        clearTimeout(t);
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Esc anywhere closes; "/" anywhere outside an input opens
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      } else if (e.key === "/" && !open) {
        const t = e.target;
        const isTyping =
          t &&
          (t.tagName === "INPUT" ||
            t.tagName === "TEXTAREA" ||
            t.isContentEditable);
        if (isTyping) return;
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Debounced fetch
  useEffect(() => {
    if (!open) return;
    if (trimmed.length < MIN_QUERY) {
      setData(EMPTY);
      setActiveIndex(-1);
      setLoading(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search/suggest?q=${encodeURIComponent(trimmed)}`,
          { signal: ctrl.signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
        setActiveIndex(-1);
      } catch (err) {
        if (err.name !== "AbortError") setData(EMPTY);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [trimmed, open]);

  const close = () => {
    setOpen(false);
    setValue("");
    setData(EMPTY);
    setActiveIndex(-1);
  };

  const navigate = (href) => {
    if (!href) return;
    close();
    router.push(href);
  };

  const submitQuery = () => {
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!flatItems.length) return;
      setActiveIndex((i) => (i + 1) % flatItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!flatItems.length) return;
      setActiveIndex((i) => (i <= 0 ? flatItems.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && flatItems[activeIndex]) {
        navigate(flatItems[activeIndex].href);
      } else {
        submitQuery();
      }
    }
  };

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(true)}
        aria-label="Search"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>

      {open ? (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label="Search the catalog"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className={styles.panel}>
            <div className={styles.bar}>
              <span className={styles.barIcon} aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                ref={inputRef}
                type="search"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search for products, themes, gifts…"
                className={styles.input}
                autoComplete="off"
                aria-label="Search the catalog"
              />
              {value ? (
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={() => {
                    setValue("");
                    setData(EMPTY);
                    inputRef.current?.focus();
                  }}
                >
                  Clear
                </button>
              ) : null}
              <button
                type="button"
                className={styles.closeBtn}
                onClick={close}
                aria-label="Close search"
              >
                Close
              </button>
            </div>

            <div className={styles.results}>
              {!showResults ? (
                <div className={styles.hint}>
                  Try a product, character, or occasion. e.g.{" "}
                  <em>frozen bag</em>, <em>school labels</em>,{" "}
                  <em>dinosaur gifts</em>.
                </div>
              ) : loading && !hasAnyResults ? (
                <div className={styles.hint}>Searching…</div>
              ) : !hasAnyResults ? (
                <div className={styles.hint}>
                  No matches yet. Press Enter to see broader suggestions for{" "}
                  <em>“{trimmed}”</em>.
                </div>
              ) : (
                <>
                  {data.categoryResults.length > 0 ? (
                    <div className={styles.section}>
                      <div className={styles.sectionHead}>
                        Jump to a category
                      </div>
                      <div className={styles.chipRow}>
                        {data.categoryResults.map((cat, idx) => {
                          const flatIdx = idx;
                          return (
                            <Link
                              key={cat.href}
                              href={cat.href}
                              className={`${styles.chip} ${
                                activeIndex === flatIdx
                                  ? styles.rowActive
                                  : ""
                              }`}
                              onMouseEnter={() => setActiveIndex(flatIdx)}
                              onClick={() => navigate(cat.href)}
                            >
                              {cat.title}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {data.productResults.length > 0 ? (
                    <div className={styles.section}>
                      <div className={styles.sectionHead}>Products</div>
                      {data.productResults.map((p, idx) => {
                        const flatIdx = data.categoryResults.length + idx;
                        return (
                          <Link
                            key={p.id}
                            href={`/product/${p.slug}`}
                            className={`${styles.row} ${
                              activeIndex === flatIdx ? styles.rowActive : ""
                            }`}
                            onMouseEnter={() => setActiveIndex(flatIdx)}
                            onClick={() => navigate(`/product/${p.slug}`)}
                          >
                            <div className={styles.rowImage}>
                              {p.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={p.image} alt="" />
                              ) : (
                                <div className={styles.rowImageFallback} />
                              )}
                            </div>
                            <div className={styles.rowMain}>
                              <h4 className={styles.rowTitle}>{p.title}</h4>
                              <p className={styles.rowSub}>
                                {(p.categories || []).slice(0, 2).join(" · ") ||
                                  "—"}
                              </p>
                            </div>
                            <div className={styles.rowPrice}>
                              <span className={styles.rowPriceNow}>
                                {formatPrice(p.price)}
                              </span>
                              {p.originalPrice &&
                              p.originalPrice > p.price ? (
                                <span className={styles.rowPriceWas}>
                                  {formatPrice(p.originalPrice)}
                                </span>
                              ) : null}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </>
              )}
            </div>

            {showResults && hasAnyResults ? (
              <Link
                href={`/search?q=${encodeURIComponent(trimmed)}`}
                className={styles.viewAll}
                onClick={close}
              >
                See all results for &ldquo;{trimmed}&rdquo; →
              </Link>
            ) : null}

            <div className={styles.foot}>
              <span className={styles.kbd}>
                <code>↑</code>
                <code>↓</code> navigate
              </span>
              <span className={styles.kbd}>
                <code>↵</code> open
              </span>
              <span className={styles.kbd}>
                <code>esc</code> close
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
