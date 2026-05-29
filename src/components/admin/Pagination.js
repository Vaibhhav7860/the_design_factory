"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import styles from "./Pagination.module.css";
import { PER_PAGE_OPTIONS } from "@/lib/pagination";

const numberFormat = new Intl.NumberFormat("en-IN");

function getPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([
    1,
    2,
    current - 1,
    current,
    current + 1,
    total - 1,
    total,
  ]);
  const pages = [...set]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  for (const p of pages) {
    if (p > prev + 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

/**
 * Server-driven pagination footer.
 *
 * Props:
 *   total     - total record count
 *   page      - current 1-based page
 *   perPage   - current items per page (must be in PER_PAGE_OPTIONS)
 *   label     - what's being paginated, plural (default "items")
 */
export default function Pagination({
  total,
  page,
  perPage,
  label = "items",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * perPage + 1;
  const end = Math.min(safePage * perPage, total);

  const navigate = (overrides) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(overrides)) {
      if (value === null || value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    }
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const goTo = (p) => {
    if (p < 1 || p > totalPages || p === safePage) return;
    navigate({ page: p === 1 ? null : p });
  };

  const onPerPageChange = (event) => {
    const next = Number(event.target.value);
    // Reset to page 1 when changing density
    navigate({ perPage: next === 20 ? null : next, page: null });
  };

  const pageList = getPageList(safePage, totalPages);

  return (
    <div className={styles.bar} data-pending={isPending ? "true" : "false"}>
      <div className={styles.summary}>
        {total > 0 ? (
          <>
            Showing <strong>{numberFormat.format(start)}</strong>–
            <strong>{numberFormat.format(end)}</strong> of{" "}
            <strong>{numberFormat.format(total)}</strong> {label}
          </>
        ) : (
          <>No {label} match these filters</>
        )}
      </div>

      <div className={styles.controls}>
        <label className={styles.perPage}>
          <span className={styles.perPageLabel}>Show</span>
          <select
            value={perPage}
            onChange={onPerPageChange}
            disabled={isPending}
            aria-label={`${label} per page`}
          >
            {PER_PAGE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt} per page
              </option>
            ))}
          </select>
        </label>

        <nav className={styles.pages} aria-label="Pagination">
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => goTo(safePage - 1)}
            disabled={safePage <= 1 || isPending}
            aria-label="Previous page"
          >
            <HiOutlineChevronLeft />
          </button>

          {pageList.map((p, idx) =>
            p === "…" ? (
              <span key={`gap-${idx}`} className={styles.ellipsis}>
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                className={`${styles.pageBtn} ${
                  p === safePage ? styles.pageBtnActive : ""
                }`}
                onClick={() => goTo(p)}
                disabled={isPending}
                aria-current={p === safePage ? "page" : undefined}
              >
                {p}
              </button>
            )
          )}

          <button
            type="button"
            className={styles.navBtn}
            onClick={() => goTo(safePage + 1)}
            disabled={safePage >= totalPages || isPending}
            aria-label="Next page"
          >
            <HiOutlineChevronRight />
          </button>
        </nav>
      </div>
    </div>
  );
}
