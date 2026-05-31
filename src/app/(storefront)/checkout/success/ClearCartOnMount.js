"use client";

import { useEffect } from "react";
import { useCart } from "@/context/CartContext";

/**
 * Client island that clears the cart once the success page has actually
 * rendered. Living here (not on the checkout page itself) avoids a
 * race where the checkout page's "redirect on empty cart" effect would
 * push the user to /cart before the success-page redirect fires.
 */
export default function ClearCartOnMount() {
  const { clearCart } = useCart();
  useEffect(() => {
    try {
      clearCart?.();
    } catch {
      // Best-effort — never want this to break the page
    }
  }, [clearCart]);
  return null;
}
