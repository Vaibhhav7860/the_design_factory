"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/(storefront)/account/dashboard.module.css";

export default function ProfileForm({ initial }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    firstName: initial.firstName || "",
    lastName: initial.lastName || "",
    phone: initial.phone || "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saved, setSaved] = useState(false);

  const onChange = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setSaved(false);
    setErrors((prev) => {
      if (!prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    setSaved(false);

    const fast = {};
    if (!form.firstName.trim()) fast.firstName = "First name is required.";
    if (!form.lastName.trim()) fast.lastName = "Last name is required.";
    if (Object.keys(fast).length) {
      setErrors(fast);
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/account/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) {
          if (data?.fieldErrors) setErrors(data.fieldErrors);
          setFormError(data?.error || "Could not save profile.");
          return;
        }
        setSaved(true);
        // refresh server components so the hero name / sidebar update
        router.refresh();
        setTimeout(() => setSaved(false), 2400);
      } catch (err) {
        setFormError(err?.message || "Could not save profile.");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      {formError ? <div className={styles.formError}>{formError}</div> : null}
      {saved ? (
        <div className={styles.formSuccess}>Profile updated.</div>
      ) : null}

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label htmlFor="firstName" className={styles.label}>
            First name
          </label>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            value={form.firstName}
            onChange={onChange("firstName")}
            className={`${styles.input} ${errors.firstName ? styles.inputError : ""}`}
          />
          {errors.firstName ? (
            <p className={styles.fieldError}>{errors.firstName}</p>
          ) : null}
        </div>

        <div className={styles.field}>
          <label htmlFor="lastName" className={styles.label}>
            Last name
          </label>
          <input
            id="lastName"
            type="text"
            autoComplete="family-name"
            value={form.lastName}
            onChange={onChange("lastName")}
            className={`${styles.input} ${errors.lastName ? styles.inputError : ""}`}
          />
          {errors.lastName ? (
            <p className={styles.fieldError}>{errors.lastName}</p>
          ) : null}
        </div>

        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={initial.email}
            disabled
            className={styles.input}
          />
          <p className={styles.fieldHint}>
            Reach us if you need to change the email on your account.
          </p>
        </div>

        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label htmlFor="phone" className={styles.label}>
            Mobile number
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={onChange("phone")}
            className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
            placeholder="+91 98765 43210"
          />
          {errors.phone ? (
            <p className={styles.fieldError}>{errors.phone}</p>
          ) : null}
        </div>
      </div>

      <div className={styles.actionsRow}>
        <button
          type="submit"
          className={styles.btnPrimary}
          disabled={isPending}
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
