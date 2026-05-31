"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import styles from "../account.module.css";

const FIELDS = [
  { key: "firstName", label: "First name", autoComplete: "given-name" },
  { key: "lastName", label: "Last name", autoComplete: "family-name" },
  { key: "email", label: "Email address", type: "email", autoComplete: "email", full: true },
  { key: "phone", label: "Mobile number", type: "tel", autoComplete: "tel", full: true, placeholder: "+91 98765 43210" },
  { key: "password", label: "Password", type: "password", autoComplete: "new-password", full: true, placeholder: "Min. 8 characters" },
  { key: "confirmPassword", label: "Confirm password", type: "password", autoComplete: "new-password", full: true },
];

export default function SignUpForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);

  const onChange = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
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

    // Quick client-side guards before hitting the server
    const fast = {};
    if (!form.firstName.trim()) fast.firstName = "First name is required.";
    if (!form.lastName.trim()) fast.lastName = "Last name is required.";
    if (!form.email.trim()) fast.email = "Email is required.";
    if (!form.phone.trim()) fast.phone = "Mobile number is required.";
    if (!form.password) fast.password = "Password is required.";
    if (form.password.length > 0 && form.password.length < 8) {
      fast.password = "Password must be at least 8 characters.";
    }
    if (!form.confirmPassword) fast.confirmPassword = "Please confirm your password.";
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      fast.confirmPassword = "Passwords do not match.";
    }
    if (Object.keys(fast).length) {
      setErrors(fast);
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/sign-up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) {
          if (data?.fieldErrors) setErrors(data.fieldErrors);
          setFormError(data?.error || "Could not create account.");
          return;
        }
        // Auto-sign-in immediately
        const signInRes = await signIn("customer-credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
          callbackUrl: "/account",
        });
        router.push(signInRes?.url || "/account");
        router.refresh();
      } catch (err) {
        setFormError(err?.message || "Could not create account.");
      }
    });
  };

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {formError ? <div className={styles.formError}>{formError}</div> : null}

      <div className={styles.row2}>
        {[FIELDS[0], FIELDS[1]].map((f) => (
          <FormField
            key={f.key}
            field={f}
            value={form[f.key]}
            error={errors[f.key]}
            onChange={onChange(f.key)}
          />
        ))}
      </div>

      {FIELDS.slice(2).map((f) => (
        <FormField
          key={f.key}
          field={f}
          value={form[f.key]}
          error={errors[f.key]}
          onChange={onChange(f.key)}
        />
      ))}

      <button type="submit" className={styles.submit} disabled={isPending}>
        {isPending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}

function FormField({ field, value, onChange, error }) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={field.key}>
        {field.label}
      </label>
      <input
        id={field.key}
        type={field.type || "text"}
        autoComplete={field.autoComplete}
        value={value}
        onChange={onChange}
        className={`${styles.input} ${error ? styles.inputError : ""}`}
        placeholder={field.placeholder}
        aria-invalid={Boolean(error) || undefined}
        required
      />
      {error ? <p className={styles.fieldError}>{error}</p> : null}
    </div>
  );
}
