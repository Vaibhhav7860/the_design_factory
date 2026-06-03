"use server";

import { connectToDatabase } from "@/lib/db/mongoose";
import { Category, Product } from "@/lib/db/models";
import { saveFormDataImages } from "@/lib/storage/index";
import { revalidatePath } from "next/cache";

export async function searchProducts(query) {
  if (!query || query.length < 2) return [];
  await connectToDatabase();
  const products = await Product.find({
    title: { $regex: query, $options: "i" },
  })
    .select("title images slug")
    .limit(10)
    .lean();
    
  return products.map(p => ({
    _id: p._id.toString(),
    title: p.title,
    image: p.images?.[0] || null,
    slug: p.slug
  }));
}

export async function createSubcategory(formData) {
  try {
    await connectToDatabase();
    
    const categoryId = formData.get("categoryId");
    const subcategoryName = formData.get("subcategoryName");
    const selectedProductIds = JSON.parse(formData.get("selectedProductIds") || "[]");
    
    if (!categoryId || !subcategoryName) {
      throw new Error("Missing required fields");
    }
    
    const slug = subcategoryName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
      
    // 1. Upload image to Cloudflare CDN
    let imageUrl = "";
    if (formData.has("image") && formData.get("image").size > 0) {
      const saved = await saveFormDataImages(formData, "image", {
        folder: `categories/${slug}`,
      });
      if (saved && saved.length > 0) {
        imageUrl = saved[0].url;
      }
    }
    
    const newSubcategory = {
      title: subcategoryName,
      slug,
      image: imageUrl,
    };
    
    // 2. Update the Category in MongoDB
    await Category.findByIdAndUpdate(categoryId, {
      $push: { subcategories: newSubcategory }
    });
    
    // 3. Update the selected products to belong to this subcategory
    if (selectedProductIds.length > 0) {
      await Product.updateMany(
        { _id: { $in: selectedProductIds } },
        { $addToSet: { subcategories: slug } }
      );
    }
    
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to create subcategory:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteSubcategory(categoryId, subcategorySlug) {
  try {
    await connectToDatabase();
    
    // 1. Remove subcategory from Category
    await Category.findByIdAndUpdate(categoryId, {
      $pull: { subcategories: { slug: subcategorySlug } }
    });
    
    // 2. Remove subcategory slug from all Products that have it
    await Product.updateMany(
      { subcategories: subcategorySlug },
      { $pull: { subcategories: subcategorySlug } }
    );
    
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to delete subcategory:", error);
    return { success: false, error: error.message };
  }
}

export async function createNewCategory(formData) {
  try {
    await connectToDatabase();
    
    const categoryName = formData.get("categoryName");
    const tagline = formData.get("tagline") || "";
    
    if (!categoryName) {
      throw new Error("Category Name is required");
    }
    
    const slug = categoryName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
      
    // Upload image to Cloudflare CDN
    let imageUrl = "";
    if (formData.has("image") && formData.get("image").size > 0) {
      const saved = await saveFormDataImages(formData, "image", {
        folder: `categories/${slug}`,
      });
      if (saved && saved.length > 0) {
        imageUrl = saved[0].url;
      }
    }
    
    if (!imageUrl) {
      throw new Error("Cover Image is required");
    }
    
    const newCategory = new Category({
      title: categoryName,
      description: categoryName, // Fallback since it's required
      tagline: tagline,
      slug: slug,
      image: imageUrl,
      subcategories: []
    });
    
    await newCategory.save();
    
    revalidatePath("/admin/categories");
    revalidatePath("/explore");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCategory(categoryId) {
  try {
    await connectToDatabase();
    
    if (!categoryId) {
      throw new Error("Category ID is required");
    }
    
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new Error("Category not found");
    }
    
    await Category.findByIdAndDelete(categoryId);
    
    revalidatePath("/admin/categories");
    revalidatePath("/explore");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false, error: error.message };
  }
}
