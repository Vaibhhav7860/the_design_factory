import BrandPanel from "@/components/account/BrandPanel";
import ForgotPasswordForm from "./ForgotPasswordForm";
import styles from "../account.module.css";

export const metadata = {
  title: "Forgot password · The Design Factory",
};

export default function ForgotPasswordPage() {
  return (
    <div className={styles.page}>
      <BrandPanel
        topline="Reset"
        hero={<>Forgot your <em>password</em>?</>}
        sub="Drop in your email and we'll send you a link to set a new one. The link is valid for the next 60 minutes."
      />

      <div className={styles.formPanel}>
        <div className={styles.card}>
          <h1 className={styles.title}>Reset your password</h1>
          <p className={styles.subtitle}>
            We&apos;ll email you a secure link to choose a new password.
          </p>
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
