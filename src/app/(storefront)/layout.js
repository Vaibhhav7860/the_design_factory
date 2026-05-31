import { CartProvider } from "@/context/CartContext";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import AuthSessionProvider from "@/components/auth/AuthSessionProvider";

export default function StorefrontLayout({ children }) {
  return (
    <AuthSessionProvider>
      <CartProvider>
        <ConditionalLayout>{children}</ConditionalLayout>
      </CartProvider>
    </AuthSessionProvider>
  );
}
