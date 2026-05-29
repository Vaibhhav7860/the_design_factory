"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HiOutlineX, HiOutlineDownload, HiOutlineExclamationCircle } from "react-icons/hi";
import { Button } from "./Button";
import { PER_PAGE_OPTIONS } from "@/lib/pagination";
import styles from "./ExportDialog.module.css";

const numberFormat = new Intl.NumberFormat("en-IN");
const HARD_CAP = 50000;

/**
 * Export dialog used by Products / Orders / Customers pages.
 *
 * Props:
 *   open       — boolean, whether the dialog is rendered
 *   onClose    — callback to close it
 *   resource   — "products" | "orders" | "customers"
 *   total      — total record count (for the "All" summary line)
 *   matchedTotal — count of records matching the current search/filter
 *   filename   — final downloaded filename (e.g. "products_Export.csv")
 *   apiPath    — endpoint that returns the CSV (e.g. "/api/admin/products/export")
 *   currentPage  — page the user is currently viewing
 *   currentPerPage — perPage they're currently viewing
 *   currentQuery   — search query in the URL right now (preserved in export)
 *   extraQuery     — additional URL params to forward (e.g. order status)
 */
export default function ExportDialog({
  open,
  onClose,
  resource,
  total,
  matchedTotal,
  filename,
  apiPath,
  currentPage = 1,
  currentPerPage = 20,
  currentQuery = "",
  extraQuery = {},
}) {
  const [scope, setScope] = useState("all");
  const [perPage, setPerPage] = useState(50);
  const [fromPage, setFromPage] = useState(1);
  const [toPage, setToPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const dialogRef = useRef(null);

  const recordCap = matchedTotal ?? total ?? 0;
  const totalPages = Math.max(1, Math.ceil(recordCap / perPage));

  // Reset state on open so the dialog feels predictable
  useEffect(() => {
    if (!open) return;
    setScope("all");
    setPerPage(currentPerPage || 50);
    setFromPage(1);
    setToPage(Math.max(1, Math.ceil((matchedTotal ?? total ?? 0) / (currentPerPage || 50))));
    setError(null);
  }, [open, currentPerPage, matchedTotal, total]);

  // Recompute toPage default when perPage changes while dialog is open
  useEffect(() => {
    if (!open) return;
    setToPage((prev) => Math.min(prev, Math.max(1, Math.ceil(recordCap / perPage))));
    setFromPage((prev) => Math.min(prev, Math.max(1, Math.ceil(recordCap / perPage))));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perPage, recordCap]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const estimatedCount = useMemo(() => {
    if (scope === "all") return Math.min(recordCap, HARD_CAP);
    if (scope === "current") {
      const skip = (currentPage - 1) * perPage;
      return Math.max(0, Math.min(perPage, recordCap - skip));
    }
    // range
    const lo = Math.min(fromPage, toPage);
    const hi = Math.max(fromPage, toPage);
    const skip = (lo - 1) * perPage;
    const span = (hi - lo + 1) * perPage;
    return Math.max(0, Math.min(span, recordCap - skip, HARD_CAP));
  }, [scope, recordCap, perPage, fromPage, toPage, currentPage]);

  const validate = () => {
    if (scope !== "range") return null;
    const lo = Math.min(fromPage, toPage);
    const hi = Math.max(fromPage, toPage);
    if (lo < 1) return "Start page must be 1 or greater.";
    if (hi > totalPages) return `End page can be at most ${totalPages} for ${perPage} records per page.`;
    return null;
  };

  const handleExport = async () => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    setBusy(true);

    const params = new URLSearchParams();
    params.set("scope", scope);
    params.set("perPage", String(perPage));
    if (currentQuery) params.set("q", currentQuery);
    for (const [k, val] of Object.entries(extraQuery)) {
      if (val !== undefined && val !== null && val !== "") {
        params.set(k, String(val));
      }
    }
    if (scope === "current") {
      params.set("page", String(currentPage));
    } else if (scope === "range") {
      const lo = Math.min(fromPage, toPage);
      const hi = Math.max(fromPage, toPage);
      params.set("from", String(lo));
      params.set("to", String(hi));
    }

    try {
      const res = await fetch(`${apiPath}?${params.toString()}`, {
        method: "GET",
      });
      if (!res.ok) {
        let message = `Export failed (${res.status})`;
        try {
          const j = await res.json();
          if (j?.error) message = j.error;
        } catch {}
        throw new Error(message);
      }
      const blob = await res.blob();
      // Trigger a real download with the filename the spec asked for
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      setBusy(false);
      onClose?.();
    } catch (err) {
      setBusy(false);
      setError(err.message || "Export failed");
    }
  };

  if (!open) return null;

  const filterNote = currentQuery ? (
    <>
      The export reflects your current search for{" "}
      <strong>&ldquo;{currentQuery}&rdquo;</strong>.
    </>
  ) : null;

  return (
    <div className={styles.scrim} role="dialog" aria-modal="true" onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose?.();
    }}>
      <div className={styles.dialog} ref={dialogRef}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Export {resource}</h2>
            <p className={styles.subtitle}>
              Download a CSV file. {filterNote}
            </p>
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close"
          >
            <HiOutlineX />
          </button>
        </div>

        <div className={styles.body}>
          {/* ── Records per page ── */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Records per page</label>
            <div className={styles.perPageWrap}>
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
              >
                {[...new Set([...PER_PAGE_OPTIONS, 200, 500])].sort((a, b) => a - b).map((n) => (
                  <option key={n} value={n}>
                    {n} per page
                  </option>
                ))}
              </select>
              <span style={{ fontSize: 12, color: "var(--admin-ink-muted)" }}>
                {numberFormat.format(totalPages)}{" "}
                {totalPages === 1 ? "page" : "pages"} total
              </span>
            </div>
          </div>

          {/* ── Scope ── */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>What to export</label>
            <div className={styles.scopeList}>
              <ScopeOption
                checked={scope === "all"}
                onChange={() => setScope("all")}
                title={`All ${resource}`}
                description={`Every record${currentQuery ? " matching the current search" : ""} (up to ${numberFormat.format(HARD_CAP)} max).`}
              />
              <ScopeOption
                checked={scope === "current"}
                onChange={() => setScope("current")}
                title={`Current page only`}
                description={`Page ${currentPage} as you're viewing it.`}
              />
              <ScopeOption
                checked={scope === "range"}
                onChange={() => setScope("range")}
                title={`Page range`}
                description="Choose a start and end page to export."
              >
                <div className={styles.rangeRow}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>From page</label>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={fromPage}
                      onChange={(e) => setFromPage(Number(e.target.value) || 1)}
                      onFocus={() => setScope("range")}
                      className={styles.numberInput}
                      disabled={scope !== "range"}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>To page</label>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={toPage}
                      onChange={(e) => setToPage(Number(e.target.value) || 1)}
                      onFocus={() => setScope("range")}
                      className={styles.numberInput}
                      disabled={scope !== "range"}
                    />
                  </div>
                </div>
              </ScopeOption>
            </div>
          </div>

          {/* ── Summary ── */}
          <div className={styles.summary}>
            Exporting approximately{" "}
            <strong>{numberFormat.format(estimatedCount)}</strong>{" "}
            {estimatedCount === 1 ? resource.replace(/s$/, "") : resource}{" "}
            into <strong>{filename}</strong>.
            {estimatedCount >= HARD_CAP ? (
              <p className={styles.summaryWarn}>
                <HiOutlineExclamationCircle />
                Large export — capped at {numberFormat.format(HARD_CAP)} rows.
                Use a narrower page range for the rest.
              </p>
            ) : null}
          </div>
        </div>

        <div className={styles.footer}>
          {error ? <span className={styles.error}>{error}</span> : null}
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="primary"
            iconLeft={<HiOutlineDownload />}
            onClick={handleExport}
            disabled={busy || estimatedCount === 0}
          >
            {busy ? "Preparing CSV…" : `Download CSV`}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ScopeOption({ checked, onChange, title, description, children }) {
  return (
    <label
      className={`${styles.scopeOption} ${checked ? styles.scopeOptionActive : ""}`}
    >
      <input type="radio" checked={checked} onChange={onChange} />
      <div>
        <strong>{title}</strong>
        <span>{description}</span>
        {children}
      </div>
    </label>
  );
}
