"use client";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./LoginForm.module.css";

export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [needsTotp, setNeedsTotp] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          email,
          password,
          totp,
          redirect: false,
        });
        if (result?.error) {
          // We can't tell from the response alone whether MFA was required;
          // a UX-friendly approach is to show the TOTP field on the next attempt
          // if the email looks valid.
          if (!needsTotp) setNeedsTotp(true);
          setError("Sign-in failed. Check your credentials and verification code.");
          return;
        }
        const dest = search.get("from") || "/admin";
        router.push(dest);
        router.refresh();
      } catch (err) {
        setError("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@thedesignfactory.in"
        />
      </div>

      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label htmlFor="password">Password</label>
          <a href="/admin/forgot-password" className={styles.forgotLink}>
            Forgot?
          </a>
        </div>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
        />
      </div>

      {needsTotp ? (
        <div className={styles.field}>
          <label htmlFor="totp">Authenticator code</label>
          <input
            id="totp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={totp}
            onChange={(e) => setTotp(e.target.value.replace(/\D/g, ""))}
            placeholder="123 456"
          />
          <span className={styles.hint}>
            Open your authenticator app and enter the 6-digit code.
          </span>
        </div>
      ) : null}

      {error ? <div className={styles.error} role="alert">{error}</div> : null}

      <button type="submit" className={styles.submit} disabled={isPending}>
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
