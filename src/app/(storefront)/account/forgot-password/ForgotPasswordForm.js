"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import styles from "../account.module.css";

export default function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data?.error || "Could not send reset link.");
          return;
        }
        setSent(true);
      } catch (err) {
        setError(err?.message || "Could not send reset link.");
      }
    });
  };

  if (sent) {
    return (
      <div className={styles.formSuccess}>
        <strong>Check your inbox.</strong>
        <p style={{ margin: "8px 0 0", lineHeight: 1.5 }}>
          If an account exists for <strong>{email}</strong>, we&apos;ve sent
          a link to reset your password. The link is valid for the next 60
          minutes.
        </p>
        <p style={{ margin: "10px 0 0", fontSize: 12, color: "#6b6b6b" }}>
          Don&apos;t see it? Check your spam folder or{" "}
          <Link
            href="/account/forgot-password"
            onClick={() => setSent(false)}
            style={{ color: "#b89968", textDecoration: "underline" }}
          >
            try a different email
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {error ? <div className={styles.formError}>{error}</div> : null}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          placeholder="[email protected]"
        />
      </div>

      <button type="submit" className={styles.submit} disabled={isPending}>
        {isPending ? "Sending…" : "Email me a reset link"}
      </button>

      <p className={styles.metaRow}>
        Remembered it? <Link href="/account/sign-in">Back to sign in</Link>
      </p>
    </form>
  );
}
