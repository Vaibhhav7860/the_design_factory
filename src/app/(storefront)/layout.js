import { CartProvider } from "@/context/CartContext";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import AuthSessionProvider from "@/components/auth/AuthSessionProvider";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Category } from "@/lib/db/models";

export const dynamic = "force-dynamic";

export default async function StorefrontLayout({ children }) {
  let categories = [];
  try {
    await connectToDatabase();
    const dbCategories = await Category.find({}).sort({ title: 1 }).lean();
    
    // Safely serialize for Client Component (handles _id and Date objects)
    categories = JSON.parse(JSON.stringify(dbCategories));
  } catch (error) {
    console.error("Failed to fetch categories for StorefrontLayout", error);
  }

  return (
    <AuthSessionProvider>
      <CartProvider>
        <ConditionalLayout categories={categories}>{children}</ConditionalLayout>
      </CartProvider>
    </AuthSessionProvider>
  );
}

