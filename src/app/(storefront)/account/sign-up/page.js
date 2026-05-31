import Link from "next/link";
import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import BrandPanel from "@/components/account/BrandPanel";
import GoogleButton from "@/components/account/GoogleButton";
import SignUpForm from "./SignUpForm";
import styles from "../account.module.css";

export const metadata = {
  title: "Create an account · The Design Factory",
};

export const dynamic = "force-dynamic";

export default async function SignUpPage() {
  const session = await auth();
  if (session?.user) redirect("/account");

  return (
    <div className={styles.page}>
      <BrandPanel
        topline="Join us"
        hero={<>A little <em>thoughtful</em> for every occasion.</>}
        sub="Create your account to keep track of orders, save your favourite gifts, and check out faster next time."
      />

      <div className={styles.formPanel}>
        <div className={styles.card}>
          <h1 className={styles.title}>Create an account</h1>
          <p className={styles.subtitle}>
            Build your gifting moments — start with a few details.
          </p>

          <GoogleButton label="Sign up with Google" callbackUrl="/account" />

          <div className={styles.divider}>
            <span className={styles.dividerText}>or</span>
          </div>

          <SignUpForm />

          <p className={styles.metaRow}>
            Already have an account?{" "}
            <Link href="/account/sign-in">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
