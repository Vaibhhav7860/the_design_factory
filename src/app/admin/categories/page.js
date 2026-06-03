import PageHeader from "@/components/admin/PageHeader";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Product, Category } from "@/lib/db/models";
import CategoriesClient from "./CategoriesClient";
import CreateCategoryButton from "./CreateCategoryButton";
import styles from "./categories.module.css";

export const metadata = { title: "Categories · Admin" };
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  let subcategoryCounts = {};
  let dbCategories = [];

  try {
    await connectToDatabase();
    
    // Fetch categories from MongoDB
    dbCategories = await Category.find({}).sort({ title: 1 }).lean();
    
    // Aggregation pipeline to count products per subcategory
    const pipeline = [
      { $unwind: "$subcategories" },
      { $group: { _id: "$subcategories", count: { $sum: 1 } } }
    ];
    
    const results = await Product.aggregate(pipeline);
    
    // Convert to a map for easy lookup
    results.forEach(result => {
      if (result._id) {
        subcategoryCounts[result._id] = result.count;
      }
    });
  } catch (err) {
    console.error("Failed to fetch product counts for categories", err);
  }

  // Convert ObjectIds to strings to pass to Client Component safely
  const safeCategories = dbCategories.map(cat => ({
    ...cat,
    _id: cat._id.toString(),
    subcategories: cat.subcategories.map(sub => ({
      ...sub,
      _id: sub._id.toString()
    }))
  }));

  return (
    <div className={styles.pageContainer}>
      <PageHeader
        eyebrow="Catalogue"
        title="Categories"
        description="View your product categories and navigate to specific sub-category inventories."
        actions={<CreateCategoryButton />}
      />

      <CategoriesClient 
        categories={safeCategories} 
        subcategoryCounts={subcategoryCounts} 
      />
    </div>
  );
}
