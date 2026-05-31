"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import styles from "../account.module.css";

export default function SignInForm({ callbackUrl = "/account" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ email: "", password: "" });

  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }
    startTransition(async () => {
      try {
        const res = await signIn("customer-credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
          callbackUrl,
        });
        if (!res || res.error) {
          setError(
            "Those details didn't match an account. Check your email and password and try again."
          );
          return;
        }
        router.push(res.url || callbackUrl);
        router.refresh();
      } catch (err) {
        setError(err?.message || "Could not sign in. Try again.");
      }
    });
  };

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
          value={form.email}
          onChange={onChange("email")}
          className={styles.input}
          placeholder="[email protected]"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={onChange("password")}
          className={styles.input}
          placeholder="••••••••"
        />
      </div>

      <div className={styles.forgotRow}>
        <Link href="/account/forgot-password">Forgot password?</Link>
      </div>

      <button type="submit" className={styles.submit} disabled={isPending}>
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
