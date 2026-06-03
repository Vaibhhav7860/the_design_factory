"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { HiOutlineArrowRight, HiPlus, HiOutlineTrash } from "react-icons/hi";
import styles from "./categories.module.css";
import AddSubcategoryModal from "./AddSubcategoryModal";
import { deleteSubcategory, deleteCategory } from "./actions";

export default function CategoriesClient({ categories, subcategoryCounts }) {
  const [activeModalCategory, setActiveModalCategory] = useState(null);
  const [isPending, startTransition] = useTransition();

  const handleDeleteSubcategory = (categoryId, subcategorySlug) => {
    if (confirm("Are you sure you want to delete this subcategory? This will not delete the products inside it, but will remove the subcategory association.")) {
      startTransition(async () => {
        const res = await deleteSubcategory(categoryId, subcategorySlug);
        if (!res.success) {
          alert("Failed to delete subcategory: " + res.error);
        }
      });
    }
  };

  const handleDeleteCategory = (categoryId) => {
    if (confirm("Are you sure you want to delete this entire category? This action cannot be undone.")) {
      startTransition(async () => {
        const res = await deleteCategory(categoryId);
        if (!res.success) {
          alert("Failed to delete category: " + res.error);
        }
      });
    }
  };

  return (
    <div className={styles.categoryList}>
      {categories.map((category) => {
        let totalCategoryProducts = 0;
        
        // Calculate total products for this category by summing subcategory counts
        const subcategoriesWithCounts = (category.subcategories || []).map(sub => {
          const count = subcategoryCounts[sub.slug] || 0;
          totalCategoryProducts += count;
          return { ...sub, count };
        });

        return (
          <div key={category._id} className={styles.categoryCard} style={{ marginBottom: "24px" }}>
            <div className={styles.categoryHeader}>
              <div>
                <h2 className={styles.categoryTitle}>{category.title}</h2>
                <p className={styles.categoryDescription}>{category.description}</p>
              </div>
              <div className={styles.headerActions}>
                <div className={styles.totalBadge}>
                  {totalCategoryProducts} {totalCategoryProducts === 1 ? 'Product' : 'Products'}
                </div>
                <button 
                  className={styles.addSubcategoryBtn}
                  onClick={() => setActiveModalCategory(category)}
                  disabled={isPending}
                >
                  <HiPlus /> Add Sub-category
                </button>
                <button 
                  className={styles.deleteCategoryBtn}
                  onClick={() => handleDeleteCategory(category._id)}
                  title="Delete Category"
                  disabled={isPending}
                >
                  <HiOutlineTrash />
                </button>
              </div>
            </div>
            
            <div className={styles.subcategoriesGrid}>
              {subcategoriesWithCounts.map((sub) => (
                <div key={sub.slug} className={styles.subcategoryItemWrapper}>
                  <Link 
                    href={`/admin/products?subcategory=${sub.slug}`}
                    className={styles.subcategoryItem}
                  >
                    <span className={styles.subcategoryName}>{sub.title}</span>
                    <div className={styles.subcategoryCount}>
                      {sub.count} {sub.count === 1 ? 'product' : 'products'}
                      <HiOutlineArrowRight className={styles.subcategoryIcon} />
                    </div>
                  </Link>
                  <button 
                    className={styles.deleteSubcategoryBtn} 
                    onClick={() => handleDeleteSubcategory(category._id, sub.slug)}
                    title="Delete subcategory"
                    disabled={isPending}
                  >
                    <HiOutlineTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {activeModalCategory && (
        <AddSubcategoryModal 
          category={activeModalCategory} 
          onClose={() => setActiveModalCategory(null)} 
        />
      )}
    </div>
  );
}
