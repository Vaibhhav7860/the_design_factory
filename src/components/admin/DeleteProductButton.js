"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineTrash } from "react-icons/hi";
import styles from "./DeleteProductButton.module.css";

/**
 * Trash-icon button that lives inside a Products table row. Clicking
 * opens a small inline confirmation popover anchored to the button —
 * confirm fires DELETE /api/admin/products/:id, then refreshes the
 * server component so the row disappears.
 *
 * The button stops click + keyboard events from bubbling so the
 * row's full-row anchor (which navigates to the edit page) doesn't
 * fire.
 */
export default function DeleteProductButton({ id, title }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();
  const wrapRef = useRef(null);

  // Outside click closes the popover
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // Esc closes the popover
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Stop the row's overlay-anchor from picking up the click
  const swallow = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleConfirm = (e) => {
    swallow(e);
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/products/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          let message = `Delete failed (${res.status})`;
          try {
            const j = await res.json();
            if (j?.error) message = j.error;
          } catch {}
          setError(message);
          return;
        }
        setOpen(false);
        // Re-fetch the products list so the row disappears
        router.refresh();
      } catch (err) {
        setError(err?.message || "Network error");
      }
    });
  };

  return (
    <span className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.btn}
        onClick={(e) => {
          swallow(e);
          setOpen((v) => !v);
        }}
        onMouseDown={swallow}
        aria-label={`Delete ${title || "product"}`}
        title="Delete product"
        disabled={isPending}
      >
        <HiOutlineTrash />
      </button>

      {open ? (
        <div
          className={styles.popover}
          role="dialog"
          aria-label="Confirm delete"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <p className={styles.popoverTitle}>Delete this product?</p>
          <p className={styles.popoverBody}>
            <strong>{title || "Untitled"}</strong> will be removed from
            MongoDB and disappear from the storefront. This can&apos;t be
            undone.
          </p>
          {error ? <p className={styles.error}>{error}</p> : null}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancel}
              onClick={(e) => {
                swallow(e);
                setOpen(false);
              }}
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.confirm}
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      ) : null}
    </span>
  );
}
