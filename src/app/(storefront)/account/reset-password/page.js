import BrandPanel from "@/components/account/BrandPanel";
import ResetPasswordForm from "./ResetPasswordForm";
import styles from "../account.module.css";

export const metadata = {
  title: "Reset password · The Design Factory",
};

export default async function ResetPasswordPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const token = String(sp.token || "");

  return (
    <div className={styles.page}>
      <BrandPanel
        topline="Almost there"
        hero={<>Choose a new <em>password</em>.</>}
        sub="Pick something you'll remember. Min. 8 characters, the rest is up to you."
      />

      <div className={styles.formPanel}>
        <div className={styles.card}>
          <h1 className={styles.title}>Set a new password</h1>
          <p className={styles.subtitle}>
            Almost done — your new password takes effect right away.
          </p>
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  );
}
