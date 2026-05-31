"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../account.module.css";

export default function ResetPasswordForm({ token }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className={styles.formError}>
        This reset link is missing or invalid.{" "}
        <Link
          href="/account/forgot-password"
          style={{ color: "#a93226", textDecoration: "underline" }}
        >
          Request a new one
        </Link>
        .
      </div>
    );
  }

  const onSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setFormError(null);

    const fast = {};
    if (password.length < 8)
      fast.password = "Password must be at least 8 characters.";
    if (!confirmPassword)
      fast.confirmPassword = "Please confirm your password.";
    if (password && confirmPassword && password !== confirmPassword)
      fast.confirmPassword = "Passwords do not match.";
    if (Object.keys(fast).length) {
      setErrors(fast);
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password, confirmPassword }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (data?.fieldErrors) setErrors(data.fieldErrors);
          setFormError(data?.error || "Could not reset your password.");
          return;
        }
        setDone(true);
        setTimeout(() => router.push("/account/sign-in"), 1800);
      } catch (err) {
        setFormError(err?.message || "Could not reset your password.");
      }
    });
  };

  if (done) {
    return (
      <div className={styles.formSuccess}>
        <strong>All set ✓</strong>
        <p style={{ margin: "8px 0 0", lineHeight: 1.5 }}>
          Your password has been updated. Taking you to sign in…
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {formError ? <div className={styles.formError}>{formError}</div> : null}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="password">New password</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
          placeholder="Min. 8 characters"
        />
        {errors.password ? <p className={styles.fieldError}>{errors.password}</p> : null}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="confirmPassword">Confirm password</label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ""}`}
        />
        {errors.confirmPassword ? <p className={styles.fieldError}>{errors.confirmPassword}</p> : null}
      </div>

      <button type="submit" className={styles.submit} disabled={isPending}>
        {isPending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
