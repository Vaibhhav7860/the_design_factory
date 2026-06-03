import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Product } from "@/lib/db/models";

export async function POST(request) {
  try {
    const { percentage } = await request.json();
    const val = Number(percentage);

    if (isNaN(val) || val <= 0 || val > 100) {
      return NextResponse.json({ error: "Invalid discount percentage" }, { status: 400 });
    }

    await connectToDatabase();

    // Find all products that are NOT in the 'combos' category
    // AND have an originalPrice (MRP) set.
    const products = await Product.find({
      categories: { $ne: "combos" },
      originalPrice: { $gt: 0 }
    });

    let updatedCount = 0;
    
    // We update each product individually so the pre('save') hook runs
    // and calculates the discountPercent field correctly.
    for (const product of products) {
      // Save the current price into preGlobalDiscountPrice IF it's not already set
      if (!product.preGlobalDiscountPrice && product.preGlobalDiscountPrice !== 0) {
        product.preGlobalDiscountPrice = product.price;
      }

      const newPrice = Math.round(product.originalPrice * (1 - val / 100));
      
      // Update the price
      product.price = newPrice;
      
      await product.save({ validateBeforeSave: false });
      updatedCount++;
    }

    return NextResponse.json({ success: true, updatedCount });
  } catch (err) {
    console.error("Global discount error:", err);
    return NextResponse.json({ error: "Failed to apply global discount" }, { status: 500 });
  }
}
