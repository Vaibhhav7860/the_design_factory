"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import styles from "./Navbar.module.css";

/**
 * Account icon in the navbar. Routes to /account/sign-in for guests
 * and to /account for signed-in users. Renders the Google avatar (or
 * initials) if the customer signed in with a profile picture.
 */
export default function AccountIcon() {
  const { data: session, status } = useSession();
  const signedIn = status === "authenticated";
  const href = signedIn ? "/account" : "/account/sign-in";

  const initials = (session?.user?.name || session?.user?.email || "?")
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      href={href}
      aria-label={signedIn ? "Your account" : "Sign in"}
      className={styles.accountLink}
    >
      {signedIn && session?.user?.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={session.user.image}
          alt=""
          className={styles.accountAvatar}
        />
      ) : signedIn ? (
        <span className={styles.accountInitials} aria-hidden="true">
          {initials}
        </span>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )}
    </Link>
  );
}
