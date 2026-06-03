import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Product } from "@/lib/db/models";

export async function POST(request) {
  try {
    await connectToDatabase();

    // Find all products that have a preGlobalDiscountPrice set
    const products = await Product.find({
      preGlobalDiscountPrice: { $exists: true }
    });

    let restoredCount = 0;
    
    // We update each product individually so the pre('save') hook runs
    // and calculates the discountPercent field correctly.
    for (const product of products) {
      // Restore the price
      product.price = product.preGlobalDiscountPrice;
      
      // Unset the preGlobalDiscountPrice field so it's not reused
      product.preGlobalDiscountPrice = undefined;
      
      await product.save({ validateBeforeSave: false });
      restoredCount++;
    }

    return NextResponse.json({ success: true, restoredCount });
  } catch (err) {
    console.error("Restore discount error:", err);
    return NextResponse.json({ error: "Failed to restore previous discounts" }, { status: 500 });
  }
}
