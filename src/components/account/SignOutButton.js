"use client";

import { signOut } from "next-auth/react";
import styles from "@/app/(storefront)/account/dashboard.module.css";

export default function SignOutButton({ className }) {
  return (
    <button
      type="button"
      className={className || styles.heroSignOut}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Sign out
    </button>
  );
}
