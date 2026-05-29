"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const isCheckoutPage = pathname === "/checkout";

  return (
    <>
      <Navbar />
      <main>{children}</main>
      {!isCheckoutPage && <Footer />}
    </>
  );
}
