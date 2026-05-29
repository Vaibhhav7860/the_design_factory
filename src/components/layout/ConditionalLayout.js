"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * Wraps storefront pages with a Navbar and an optional Footer.
 * The Footer is hidden on the /checkout route so the focused
 * checkout flow doesn't get visually broken by long footer content.
 */
export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const hideFooter = pathname === "/checkout";

  return (
    <>
      <Navbar />
      <main>{children}</main>
      {!hideFooter && <Footer />}
    </>
  );
}
