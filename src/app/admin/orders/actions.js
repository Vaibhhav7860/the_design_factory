"use server";

import { connectToDatabase } from "@/lib/db/mongoose";
import { Order, Product } from "@/lib/db/models";
import { revalidatePath } from "next/cache";

export async function bulkUpdateOrders(orderIds, actionType) {
  if (!orderIds || orderIds.length === 0) return { success: true };

  await connectToDatabase();

  try {
    if (actionType === "fulfil") {
      // Find orders that are not fully fulfilled
      const orders = await Order.find({ _id: { $in: orderIds }, fulfilmentStatus: { $ne: "fulfilled" } }).lean();
      
      const bulkOps = orders.map((order) => {
        // Update line items
        const updatedLineItems = order.lineItems.map(item => ({
          ...item,
          fulfilledQuantity: item.quantity
        }));

        return {
          updateOne: {
            filter: { _id: order._id },
            update: {
              $set: {
                fulfilmentStatus: "fulfilled",
                lineItems: updatedLineItems
              }
            }
          }
        };
      });

      if (bulkOps.length > 0) {
        await Order.bulkWrite(bulkOps);

        const productUpdates = {};
        orders.forEach(order => {
          (order.lineItems || []).forEach(item => {
             if (item.productId) {
               productUpdates[item.productId] = (productUpdates[item.productId] || 0) + (item.quantity || 1);
             }
          });
        });
        
        const productBulkOps = Object.entries(productUpdates).map(([productId, quantity]) => ({
           updateOne: {
             filter: { _id: productId },
             update: { $inc: { salesCount: quantity } }
           }
        }));
        
        if (productBulkOps.length > 0) {
           await Product.bulkWrite(productBulkOps);
        }
      }
    } else if (actionType === "delete") {
      await Order.deleteMany({ _id: { $in: orderIds } });
    }

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (err) {
    console.error("Bulk action failed:", err);
    return { success: false, error: err.message };
  }
}
