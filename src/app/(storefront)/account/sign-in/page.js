import Link from "next/link";
import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import BrandPanel from "@/components/account/BrandPanel";
import GoogleButton from "@/components/account/GoogleButton";
import SignInForm from "./SignInForm";
import styles from "../account.module.css";

export const metadata = {
  title: "Sign in · The Design Factory",
};

export const dynamic = "force-dynamic";

export default async function SignInPage({ searchParams }) {
  const session = await auth();
  if (session?.user) redirect("/account");

  const sp = (await searchParams) || {};
  const callbackUrl = String(sp.callbackUrl || "/account");

  return (
    <div className={styles.page}>
      <BrandPanel
        topline="Welcome back"
        hero={<>Hello, <em>creator</em>.</>}
        sub="Sign in to track your orders, view past purchases, and pick up your saved cart."
      />

      <div className={styles.formPanel}>
        <div className={styles.card}>
          <h1 className={styles.title}>Sign in</h1>
          <p className={styles.subtitle}>
            Welcome back. Choose how you&apos;d like to continue.
          </p>

          <GoogleButton label="Continue with Google" callbackUrl={callbackUrl} />

          <div className={styles.divider}>
            <span className={styles.dividerText}>or</span>
          </div>

          <SignInForm callbackUrl={callbackUrl} />

          <p className={styles.metaRow}>
            New here? <Link href="/account/sign-up">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
