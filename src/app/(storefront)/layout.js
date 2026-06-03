import { CartProvider } from "@/context/CartContext";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import AuthSessionProvider from "@/components/auth/AuthSessionProvider";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Category } from "@/lib/db/models";

export default async function StorefrontLayout({ children }) {
  let categories = [];
  try {
    await connectToDatabase();
    const dbCategories = await Category.find({}).sort({ title: 1 }).lean();
    
    // Safely serialize for Client Component
    categories = dbCategories.map(cat => ({
      ...cat,
      _id: cat._id.toString(),
      subcategories: cat.subcategories.map(sub => ({
        ...sub,
        _id: sub._id.toString()
      }))
    }));
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

