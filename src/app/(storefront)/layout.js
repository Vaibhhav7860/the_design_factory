import { CartProvider } from "@/context/CartContext";
import ConditionalLayout from "@/components/layout/ConditionalLayout";

export default function StorefrontLayout({ children }) {
  return (
    <CartProvider>
      <ConditionalLayout>{children}</ConditionalLayout>
    </CartProvider>
  );
}
