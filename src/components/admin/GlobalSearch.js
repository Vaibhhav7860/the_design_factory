"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineTag,
  HiOutlineInbox,
  HiOutlineUser,
} from "react-icons/hi";
import { formatINR, formatDate } from "@/lib/format";
import styles from "./GlobalSearch.module.css";

const MIN_QUERY = 2;
const DEBOUNCE_MS = 180;

const EMPTY = {
  query: "",
  products: { total: 0, results: [] },
  orders: { total: 0, results: [] },
  customers: { total: 0, results: [] },
};

/**
 * Top-bar global search.
 *
 * • Live dropdown with categorised matches (products / orders / customers).
 * • Up/Down/Enter keyboard nav; Enter on a row navigates to its detail page.
 * • Enter on the input (with no row selected) routes to the matching tab
 *   filtered by ?q=<query> so the list pages can show the full filtered set.
 * • Escape closes; / focuses (when not already in an input).
 */
export default function GlobalSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [data, setData] = useState(EMPTY);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef(null);
  const wrapRef = useRef(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  // Flatten results for keyboard navigation
  const flatItems = useMemo(() => {
    const out = [];
    data.products.results.forEach((p) =>
      out.push({ kind: "product", href: `/admin/products/${p.id}`, item: p })
    );
    data.orders.results.forEach((o) =>
      out.push({ kind: "order", href: `/admin/orders/${o.id}`, item: o })
    );
    data.customers.results.forEach((c) =>
      out.push({ kind: "customer", href: `/admin/customers/${c.id}`, item: c })
    );
    return out;
  }, [data]);

  const trimmed = value.trim();
  const showDropdown = open && trimmed.length >= MIN_QUERY;
  const hasAnyResults =
    data.products.results.length +
      data.orders.results.length +
      data.customers.results.length >
    0;

  // Debounced fetch
  useEffect(() => {
    if (trimmed.length < MIN_QUERY) {
      setData(EMPTY);
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
          `/api/admin/search?q=${encodeURIComponent(trimmed)}`,
          { signal: ctrl.signal }
        );
        if (!res.ok) throw new Error("search failed");
        const json = await res.json();
        setData(json);
        setActiveIndex(-1);
      } catch (err) {
        if (err.name !== "AbortError") {
          setData(EMPTY);
        }
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [trimmed]);

  // Outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Keyboard shortcut: "/" focuses search
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "/") return;
      const t = e.target;
      const isTyping =
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable);
      if (isTyping) return;
      e.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const navigate = (href) => {
    setOpen(false);
    setValue("");
    setData(EMPTY);
    router.push(href);
  };

  const submitSearch = () => {
    if (!trimmed) return;
    // Default: take you to products filtered by q (most common case)
    navigate(`/admin/products?q=${encodeURIComponent(trimmed)}`);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!flatItems.length) return;
      setActiveIndex((i) => (i + 1) % flatItems.length);
      setOpen(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!flatItems.length) return;
      setActiveIndex((i) =>
        i <= 0 ? flatItems.length - 1 : i - 1
      );
      setOpen(true);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && flatItems[activeIndex]) {
        navigate(flatItems[activeIndex].href);
      } else {
        submitSearch();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const flatIndexFor = (kind, idx) => {
    if (kind === "product") return idx;
    if (kind === "order") return data.products.results.length + idx;
    return data.products.results.length + data.orders.results.length + idx;
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <div className={`${styles.search} ${showDropdown ? styles.searchOpen : ""}`}>
        <HiOutlineSearch className={styles.searchIcon} aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search orders, products, customers"
          aria-label="Search the admin"
          autoComplete="off"
        />
        {value ? (
          <button
            type="button"
            className={styles.clear}
            onClick={() => {
              setValue("");
              setData(EMPTY);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
          >
            <HiOutlineX />
          </button>
        ) : (
          <kbd className={styles.kbd}>/</kbd>
        )}
      </div>

      {showDropdown ? (
        <div className={styles.popover} role="listbox">
          {loading && !hasAnyResults ? (
            <div className={styles.popoverHint}>Searching…</div>
          ) : !hasAnyResults ? (
            <div className={styles.empty}>
              No matches for &ldquo;{trimmed}&rdquo;
            </div>
          ) : (
            <>
              {data.products.results.length ? (
                <Section
                  icon={<HiOutlineTag />}
                  label="Products"
                  total={data.products.total}
                  viewAllHref={`/admin/products?q=${encodeURIComponent(trimmed)}`}
                >
                  {data.products.results.map((p, idx) => {
                    const flat = flatIndexFor("product", idx);
                    return (
                      <Link
                        key={p.id}
                        href={`/admin/products/${p.id}`}
                        className={`${styles.row} ${
                          activeIndex === flat ? styles.rowActive : ""
                        }`}
                        onMouseEnter={() => setActiveIndex(flat)}
                        onClick={() => navigate(`/admin/products/${p.id}`)}
                      >
                        {p.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img className={styles.thumb} src={p.image} alt="" />
                        ) : (
                          <div className={styles.thumbFallback}>
                            <HiOutlineTag />
                          </div>
                        )}
                        <div className={styles.rowMain}>
                          <div className={styles.rowTitle}>{p.title}</div>
                          <div className={styles.rowSub}>
                            {p.category || p.slug}
                          </div>
                        </div>
                        <div className={styles.rowMeta}>
                          <span className={styles.rowMetaStrong}>
                            {formatINR(p.price)}
                          </span>
                          <span>{p.status}</span>
                        </div>
                      </Link>
                    );
                  })}
                </Section>
              ) : null}

              {data.orders.results.length ? (
                <Section
                  icon={<HiOutlineInbox />}
                  label="Orders"
                  total={data.orders.total}
                  viewAllHref={`/admin/orders?q=${encodeURIComponent(trimmed)}`}
                >
                  {data.orders.results.map((o, idx) => {
                    const flat = flatIndexFor("order", idx);
                    return (
                      <Link
                        key={o.id}
                        href={`/admin/orders/${o.id}`}
                        className={`${styles.row} ${
                          activeIndex === flat ? styles.rowActive : ""
                        }`}
                        onMouseEnter={() => setActiveIndex(flat)}
                        onClick={() => navigate(`/admin/orders/${o.id}`)}
                      >
                        <div className={styles.thumbFallback}>
                          <HiOutlineInbox />
                        </div>
                        <div className={styles.rowMain}>
                          <div className={styles.rowTitle}>
                            {o.orderNumber}
                          </div>
                          <div className={styles.rowSub}>
                            {o.customerName}
                            {o.customerEmail
                              ? ` · ${o.customerEmail}`
                              : ""}
                          </div>
                        </div>
                        <div className={styles.rowMeta}>
                          <span className={styles.rowMetaStrong}>
                            {formatINR(o.total)}
                          </span>
                          <span>{formatDate(o.createdAt)}</span>
                        </div>
                      </Link>
                    );
                  })}
                </Section>
              ) : null}

              {data.customers.results.length ? (
                <Section
                  icon={<HiOutlineUser />}
                  label="Customers"
                  total={data.customers.total}
                  viewAllHref={`/admin/customers?q=${encodeURIComponent(trimmed)}`}
                >
                  {data.customers.results.map((c, idx) => {
                    const flat = flatIndexFor("customer", idx);
                    return (
                      <Link
                        key={c.id}
                        href={`/admin/customers/${c.id}`}
                        className={`${styles.row} ${
                          activeIndex === flat ? styles.rowActive : ""
                        }`}
                        onMouseEnter={() => setActiveIndex(flat)}
                        onClick={() => navigate(`/admin/customers/${c.id}`)}
                      >
                        <div className={styles.thumbFallback}>
                          <HiOutlineUser />
                        </div>
                        <div className={styles.rowMain}>
                          <div className={styles.rowTitle}>{c.name}</div>
                          <div className={styles.rowSub}>{c.email}</div>
                        </div>
                        <div className={styles.rowMeta}>
                          <span className={styles.rowMetaStrong}>
                            {formatINR(c.totalSpent)}
                          </span>
                          <span>
                            {c.totalOrders}{" "}
                            {c.totalOrders === 1 ? "order" : "orders"}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </Section>
              ) : null}
            </>
          )}

          <div className={styles.foot}>
            <span className={styles.footHint}>
              <kbd className={styles.footKbd}>↑</kbd>
              <kbd className={styles.footKbd}>↓</kbd> to navigate
            </span>
            <span className={styles.footHint}>
              <kbd className={styles.footKbd}>↵</kbd> to open
            </span>
            <span className={styles.footHint}>
              <kbd className={styles.footKbd}>esc</kbd> to close
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Section({ icon, label, total, viewAllHref, children }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          {icon}
          {label} · {total}
        </span>
        {total > 5 ? (
          <Link href={viewAllHref} className={styles.viewAll}>
            View all →
          </Link>
        ) : null}
      </div>
      {children}
    </div>
  );
}
