"use server";

import crypto from "node:crypto";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Order, Product } from "@/lib/db/models";
import { auth } from "@/lib/auth/config";
import { revalidatePath } from "next/cache";

const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded", "partially_refunded"];
const FULFILMENT_STATUSES = ["unfulfilled", "partial", "fulfilled", "cancelled"];
const SHIPPING_METHODS = ["standard", "express"];

// Rupees (string|number) → integer paise. Returns 0 for blanks/invalid.
function toPaise(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

function generateOrderNumber() {
  const ts = new Date();
  const yyyymm = `${ts.getFullYear()}${String(ts.getMonth() + 1).padStart(2, "0")}`;
  const rand = crypto.randomInt(10000000, 99999999);
  return `TDF-${yyyymm}-${rand}`;
}

export async function searchProductsForOrder(query) {
  if (!query || query.length < 2) return [];
  await connectToDatabase();
  const products = await Product.find({
    title: { $regex: query, $options: "i" },
  })
    .select("title slug price images variants")
    .limit(10)
    .lean();

  return products.map((p) => ({
    _id: String(p._id),
    title: p.title,
    slug: p.slug,
    price: p.price ?? 0,
    image: p.images?.[0] || null,
    variants: (p.variants || []).map((v) => ({
      _id: String(v._id),
      sku: v.sku || "",
      price: v.price ?? p.price ?? 0,
    })),
  }));
}

export async function createOrder(payload) {
  try {
    await connectToDatabase();

    const p = payload || {};

    // ── Customer ──
    const customerName = String(p.customerName || "").trim();
    const customerEmail = String(p.customerEmail || "").trim().toLowerCase();
    const customerPhone = String(p.customerPhone || "").trim();
    if (!customerName && !customerEmail && !customerPhone) {
      throw new Error("At least one customer identifier (name, email or phone) is required");
    }

    // ── Line items ──
    const rawItems = Array.isArray(p.lineItems) ? p.lineItems : [];
    const lineItems = [];
    for (const it of rawItems) {
      if (!it?.productId) continue;
      const quantity = Math.max(1, parseInt(it.quantity, 10) || 1);
      const price = toPaise(it.priceRupees);
      const personalisationFee = toPaise(it.personalisationFeeRupees);
      const personalisation =
        it.personalisation &&
        (it.personalisation.name || it.personalisation.school || it.personalisation.font)
          ? {
              name: String(it.personalisation.name || "").trim() || undefined,
              school: String(it.personalisation.school || "").trim() || undefined,
              font: String(it.personalisation.font || "").trim() || undefined,
            }
          : undefined;

      lineItems.push({
        productId: it.productId,
        productSlug: String(it.productSlug || "").trim(),
        productTitle: String(it.productTitle || "").trim(),
        variantId: it.variantId || undefined,
        sku: String(it.sku || "").trim(),
        quantity,
        price,
        personalisationFee,
        personalisation,
      });
    }
    if (lineItems.length === 0) {
      throw new Error("Add at least one product line item");
    }

    // ── Money (paise) ──
    const subtotal = lineItems.reduce(
      (sum, li) => sum + (li.price + li.personalisationFee) * li.quantity,
      0
    );
    const shipping = toPaise(p.shippingRupees);
    const tax = toPaise(p.taxRupees);
    const discount = toPaise(p.discountRupees);
    const total = Math.max(0, subtotal + shipping + tax - discount);

    // ── Addresses ──
    const cleanAddress = (a) => {
      if (!a) return undefined;
      return {
        name: String(a.name || "").trim(),
        phone: String(a.phone || "").trim(),
        line1: String(a.line1 || "").trim(),
        line2: String(a.line2 || "").trim(),
        city: String(a.city || "").trim(),
        state: String(a.state || "").trim(),
        postalCode: String(a.postalCode || "").trim(),
        country: String(a.country || "IN").trim() || "IN",
      };
    };
    const shippingAddress = cleanAddress(p.shippingAddress);
    if (
      !shippingAddress ||
      !shippingAddress.name ||
      !shippingAddress.phone ||
      !shippingAddress.line1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postalCode
    ) {
      throw new Error(
        "Shipping address requires name, phone, line 1, city, state and postal code"
      );
    }
    const billingAddress = p.billingSameAsShipping
      ? shippingAddress
      : cleanAddress(p.billingAddress) || shippingAddress;

    // ── Status / misc ──
    const paymentStatus = PAYMENT_STATUSES.includes(p.paymentStatus)
      ? p.paymentStatus
      : "pending";
    const fulfilmentStatus = FULFILMENT_STATUSES.includes(p.fulfilmentStatus)
      ? p.fulfilmentStatus
      : "unfulfilled";
    const shippingMethod = SHIPPING_METHODS.includes(p.shippingMethod)
      ? p.shippingMethod
      : "standard";
    const tags = Array.isArray(p.tags)
      ? p.tags.map((t) => String(t).trim()).filter(Boolean)
      : String(p.tags || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

    // ── Notes (attribute to the signed-in admin) ──
    const notes = [];
    const noteText = String(p.note || "").trim();
    if (noteText) {
      let author;
      try {
        const session = await auth();
        author = session?.user?.id;
      } catch {}
      notes.push({ author, text: noteText, createdAt: new Date() });
    }

    // ── Unique order number (retry on the rare collision) ──
    let orderNumber;
    for (let attempt = 0; attempt < 5; attempt++) {
      orderNumber = generateOrderNumber();
      const exists = await Order.findOne({ orderNumber }).select("_id").lean();
      if (!exists) break;
    }

    const order = await Order.create({
      orderNumber,
      customerName,
      customerEmail: customerEmail || undefined,
      customerPhone: customerPhone || undefined,
      lineItems,
      subtotal,
      shipping,
      shippingMethod,
      tax,
      discount,
      total,
      currency: String(p.currency || "INR").trim() || "INR",
      discountCode: String(p.discountCode || "").trim() || undefined,
      shippingAddress,
      billingAddress,
      paymentStatus,
      fulfilmentStatus,
      tags,
      notes,
    });

    revalidatePath("/admin/orders");

    return { success: true, orderId: String(order._id), orderNumber };
  } catch (err) {
    console.error("Create order failed:", err);
    return { success: false, error: err.message };
  }
}

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
