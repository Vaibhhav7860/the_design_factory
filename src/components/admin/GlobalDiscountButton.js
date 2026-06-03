"use client";

import { useEffect, useRef, useState } from "react";
import { HiOutlineTag, HiOutlineX, HiOutlineCheck, HiOutlineRefresh } from "react-icons/hi";
import { Button } from "./Button";
import styles from "./GlobalDiscountButton.module.css";
import { useRouter } from "next/navigation";

export default function GlobalDiscountButton() {
  const [open, setOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  
  const [percentage, setPercentage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const dialogRef = useRef(null);
  const restoreDialogRef = useRef(null);
  const router = useRouter();

  // Reset state on open
  useEffect(() => {
    if (!open && !restoreOpen) return;
    setPercentage("");
    setError(null);
    setSuccess(null);
  }, [open, restoreOpen]);

  // Esc to close
  useEffect(() => {
    if (!open && !restoreOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !busy) {
        setOpen(false);
        setRestoreOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, restoreOpen, busy]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open && !restoreOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, restoreOpen]);

  const handleApply = async () => {
    const val = Number(percentage);
    if (isNaN(val) || val <= 0 || val > 100) {
      setError("Please enter a valid percentage between 1 and 100.");
      setSuccess(null);
      return;
    }
    
    setError(null);
    setSuccess(null);
    setBusy(true);

    try {
      const res = await fetch("/api/admin/products/global-discount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ percentage: val }),
      });

      const j = await res.json();
      if (!res.ok) {
        throw new Error(j?.error || `Update failed (${res.status})`);
      }

      setSuccess(`Successfully updated ${j.updatedCount} products.`);
      setPercentage("");
      
      setTimeout(() => {
        setOpen(false);
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to apply discount");
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    setError(null);
    setSuccess(null);
    setBusy(true);

    try {
      const res = await fetch("/api/admin/products/restore-discount", {
        method: "POST",
      });

      const j = await res.json();
      if (!res.ok) {
        throw new Error(j?.error || `Restore failed (${res.status})`);
      }

      setSuccess(`Successfully restored ${j.restoredCount} products.`);
      
      setTimeout(() => {
        setRestoreOpen(false);
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to restore discounts");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        iconLeft={<HiOutlineRefresh />}
        onClick={() => setRestoreOpen(true)}
      >
        Restore Discounts
      </Button>
      <Button
        variant="secondary"
        iconLeft={<HiOutlineTag />}
        onClick={() => setOpen(true)}
      >
        Global Discount
      </Button>

      {open && (
        <div 
          className={styles.scrim} 
          role="dialog" 
          aria-modal="true" 
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !busy) setOpen(false);
          }}
        >
          <div className={styles.dialog} ref={dialogRef}>
            <div className={styles.header}>
              <div>
                <h2 className={styles.title}>Apply Global Discount</h2>
                <p className={styles.subtitle}>
                  Set a discount percentage for all products with a mark price (excludes combos).
                </p>
              </div>
              <button
                type="button"
                className={styles.close}
                onClick={() => { if (!busy) setOpen(false); }}
                aria-label="Close"
                disabled={busy}
              >
                <HiOutlineX />
              </button>
            </div>

            <div className={styles.body}>
              <div className={styles.section}>
                <label className={styles.sectionLabel}>Discount Percentage</label>
                <div className={styles.inputGroup}>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    className={styles.numberInput}
                    placeholder="e.g. 15"
                    disabled={busy || !!success}
                  />
                  <div className={styles.inputSuffix}>%</div>
                </div>
              </div>
            </div>

            <div className={styles.footer}>
              {error ? <span className={styles.error}>{error}</span> : null}
              {success ? <span className={styles.success}>{success}</span> : null}
              
              {!success && (
                <>
                  <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    iconLeft={<HiOutlineCheck />}
                    onClick={handleApply}
                    disabled={busy || !percentage}
                  >
                    {busy ? "Applying..." : "Apply Discount"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {restoreOpen && (
        <div 
          className={styles.scrim} 
          role="dialog" 
          aria-modal="true" 
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !busy) setRestoreOpen(false);
          }}
        >
          <div className={styles.dialog} ref={restoreDialogRef}>
            <div className={styles.header}>
              <div>
                <h2 className={styles.title}>Restore Discounts</h2>
                <p className={styles.subtitle}>
                  Revert global discounts and recover individual pre-existing product prices.
                </p>
              </div>
              <button
                type="button"
                className={styles.close}
                onClick={() => { if (!busy) setRestoreOpen(false); }}
                aria-label="Close"
                disabled={busy}
              >
                <HiOutlineX />
              </button>
            </div>

            <div className={styles.body}>
              <p style={{ fontSize: 13, color: 'var(--admin-ink)', margin: 0, lineHeight: 1.5 }}>
                This action will restore the individual prices that were active before any global discount was applied. Are you sure you want to proceed?
              </p>
            </div>

            <div className={styles.footer}>
              {error ? <span className={styles.error}>{error}</span> : null}
              {success ? <span className={styles.success}>{success}</span> : null}
              
              {!success && (
                <>
                  <Button variant="ghost" onClick={() => setRestoreOpen(false)} disabled={busy}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    iconLeft={<HiOutlineRefresh />}
                    onClick={handleRestore}
                    disabled={busy}
                  >
                    {busy ? "Restoring..." : "Restore"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
