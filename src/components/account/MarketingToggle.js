"use client";

import { useState, useTransition } from "react";
import styles from "@/app/(storefront)/account/dashboard.module.css";

export default function MarketingToggle({ initial }) {
  const [on, setOn] = useState(!!initial);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const next = !on;
    setOn(next); // optimistic
    startTransition(async () => {
      const res = await fetch("/api/account/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acceptsMarketing: next }),
      });
      if (!res.ok) {
        // Roll back on failure
        setOn(!next);
      }
    });
  };

  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleLabel}>
        <strong>Marketing emails</strong>
        <span>
          Receive new collections, restocks, and seasonal offers in your inbox.
        </span>
      </div>
      <button
        type="button"
        className={styles.toggleSwitch}
        data-on={on ? "true" : "false"}
        onClick={toggle}
        disabled={isPending}
        aria-pressed={on}
        aria-label="Toggle marketing emails"
      />
    </div>
  );
}
