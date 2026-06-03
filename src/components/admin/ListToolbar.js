"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { HiOutlineSearch, HiOutlineX } from "react-icons/hi";
import styles from "./ListToolbar.module.css";

const DEBOUNCE_MS = 280;
const numberFormat = new Intl.NumberFormat("en-IN");

/**
 * Search bar that drives an admin list page via the URL.
 *
 *   ?q=<value>   gets pushed to the URL as the user types (debounced).
 *   Page resets to 1 whenever the query changes.
 */
export default function ListToolbar({
  placeholder = "Search…",
  total,
  matchedTotal,
  label = "items",
  activeSubcategory = null,
  currentSort = null,
  children,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initial = searchParams.get("q") || "";
  const [value, setValue] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef(null);
  const skipNext = useRef(true);

  // Keep input synced when the URL changes elsewhere (e.g. clearing filters)
  useEffect(() => {
    const next = searchParams.get("q") || "";
    setValue((current) => (current === next ? current : next));
    // The URL change shouldn't trigger another router.push from the debounce
    skipNext.current = true;
  }, [searchParams]);

  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = value.trim();
      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }
      // Reset pagination on every query change
      params.delete("page");
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const onClear = () => {
    setValue("");
  };

  const onClearSubcategory = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("subcategory");
    params.delete("page");
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const onSortChange = (e) => {
    const sortVal = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (sortVal && sortVal !== "relevant") {
      params.set("sort", sortVal);
    } else {
      params.delete("sort");
    }
    params.delete("page");
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const showMatchInfo = typeof matchedTotal === "number" && initial;

  return (
    <div className={styles.toolbarContainer}>
      <div className={styles.toolbar}>
        <div className={styles.search}>
          <HiOutlineSearch className={styles.searchIcon} aria-hidden="true" />
          <input
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            autoComplete="off"
          />
          {value ? (
            <button
              type="button"
              className={styles.clear}
              onClick={onClear}
              aria-label="Clear search"
            >
              <HiOutlineX />
            </button>
          ) : null}
        </div>

        {currentSort !== null && (
          <div className={styles.sortContainer}>
            <label htmlFor="sort-select" className={styles.sortLabel}>Sort by:</label>
            <select
              id="sort-select"
              className={styles.sortSelect}
              value={currentSort || "relevant"}
              onChange={onSortChange}
              disabled={isPending}
            >
              <option value="relevant">Most relevant</option>
              <option value="best_selling">Best Selling</option>
              <option value="title_asc">Title A - Z</option>
              <option value="title_desc">Title Z - A</option>
              <option value="price_desc">Highest Price</option>
              <option value="price_asc">Lowest Price</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        )}

        {children}
      </div>

      {(activeSubcategory || showMatchInfo) && (
        <div className={styles.filterRow}>
          {activeSubcategory && (
            <div className={styles.activeFilterPill}>
              <span>Subcategory: {activeSubcategory}</span>
              <button onClick={onClearSubcategory} aria-label="Remove filter" className={styles.removeFilterBtn}>
                <HiOutlineX />
              </button>
            </div>
          )}

          {showMatchInfo ? (
            <div className={styles.matchInfo}>
              {isPending ? "Searching…" : (
                <>
                  <strong>{numberFormat.format(matchedTotal)}</strong>{" "}
                  {label} match{" "}
                  <strong>&ldquo;{initial}&rdquo;</strong>
                  {typeof total === "number" && total !== matchedTotal ? (
                    <> of {numberFormat.format(total)}</>
                  ) : null}
                </>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
