"use client";

import { useState, useTransition } from "react";
import styles from "@/app/(storefront)/account/dashboard.module.css";

export default function PasswordChangeForm({ hasPassword }) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saved, setSaved] = useState(false);

  const onChange = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    setSaved(false);

    const fast = {};
    if (hasPassword && !form.currentPassword) {
      fast.currentPassword = "Enter your current password.";
    }
    if (!form.newPassword || form.newPassword.length < 8) {
      fast.newPassword = "New password must be at least 8 characters.";
    }
    if (form.newPassword !== form.confirmPassword) {
      fast.confirmPassword = "Passwords do not match.";
    }
    if (Object.keys(fast).length) {
      setErrors(fast);
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/account/password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) {
          if (data?.fieldErrors) setErrors(data.fieldErrors);
          setFormError(data?.error || "Could not update password.");
          return;
        }
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (err) {
        setFormError(err?.message || "Could not update password.");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      {formError ? <div className={styles.formError}>{formError}</div> : null}
      {saved ? (
        <div className={styles.formSuccess}>Password updated.</div>
      ) : null}

      <div className={styles.formGrid}>
        {hasPassword ? (
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label htmlFor="currentPassword" className={styles.label}>
              Current password
            </label>
            <input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={onChange("currentPassword")}
              className={`${styles.input} ${errors.currentPassword ? styles.inputError : ""}`}
            />
            {errors.currentPassword ? (
              <p className={styles.fieldError}>{errors.currentPassword}</p>
            ) : null}
          </div>
        ) : (
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <p className={styles.fieldHint}>
              You signed up with Google. Set a password here if you&apos;d
              also like to sign in with email.
            </p>
          </div>
        )}

        <div className={styles.field}>
          <label htmlFor="newPassword" className={styles.label}>
            New password
          </label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={onChange("newPassword")}
            className={`${styles.input} ${errors.newPassword ? styles.inputError : ""}`}
          />
          {errors.newPassword ? (
            <p className={styles.fieldError}>{errors.newPassword}</p>
          ) : null}
        </div>

        <div className={styles.field}>
          <label htmlFor="confirmPassword" className={styles.label}>
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={onChange("confirmPassword")}
            className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ""}`}
          />
          {errors.confirmPassword ? (
            <p className={styles.fieldError}>{errors.confirmPassword}</p>
          ) : null}
        </div>
      </div>

      <div className={styles.actionsRow}>
        <button
          type="submit"
          className={styles.btnPrimary}
          disabled={isPending}
        >
          {isPending
            ? "Updating…"
            : hasPassword
            ? "Change password"
            : "Set password"}
        </button>
      </div>
    </form>
  );
}
