"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Thin wrapper so server components can mount `<SessionProvider>` once
 * at the top of the storefront tree without leaking client directives
 * through every layout.
 */
export default function AuthSessionProvider({ children }) {
  return <SessionProvider refetchOnWindowFocus={false}>{children}</SessionProvider>;
}
