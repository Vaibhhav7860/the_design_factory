/**
 * Server-side checkout service.
 *
 * Source of truth for everything money: the *server* recomputes
 * subtotals, shipping and total from MongoDB after looking up each
 * product by slug. The browser never gets to set the price it pays.
 *
 * Money is in PAISE on the server. Cart UI uses rupees; the API
 * route at the boundary converts both directions.
 */
import crypto from "node:crypto";
import { connectToDatabase } from "../db/mongoose.js";
import { Product } from "../db/models/Product.js";
import { Order } from "../db/models/Order.js";
import { Customer } from "../db/models/Customer.js";

// Personalisation is free of cost — the constant stays so the math
// is explicit, but it's deliberately zero. Flip back to a positive
// rupee value here AND in src/lib/services/checkout.js
// (`PERSONALISATION_FEE_PAISE`) together if you ever decide to charge.
const PERSONALISATION_FEE_PAISE = 0;

// Shipping pricing. Standard shipping is free across the catalog;
// Express shipping is a flat ₹150 surcharge added to the order total.
// The browser only *picks* the method — the rupee amount lives here so
// it can never be tampered with client-side.
const EXPRESS_SHIPPING_PAISE = 15000; // ₹150
const TAX_RATE = 0.05; // 5% GST proxy used for display

const COMBO_DISCOUNT_TIERS = [
  { min: 5, percent: 20 },
  { min: 3, percent: 10 },
];
const VALID_DISCOUNT_CODES = {
  WELCOME10: { type: "percentage", value: 10 },
};

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function comboDiscountPercent(comboCount) {
  for (const tier of COMBO_DISCOUNT_TIERS) {
    if (comboCount >= tier.min) return tier.percent;
  }
  return 0;
}

function generateOrderNumber() {
  // 8-digit random + month-year prefix = unique, friendly, hard to guess
  const ts = new Date();
  const yyyymm = `${ts.getFullYear()}${String(ts.getMonth() + 1).padStart(2, "0")}`;
  const rand = crypto.randomInt(10000000, 99999999);
  return `TDF-${yyyymm}-${rand}`;
}

/**
 * Resolve the ORIGINAL slug from a cart entry. The cart sometimes
 * tacks on personalisation suffixes (e.g. "art-bag-mermaid__p__font__name")
 * or a "__combo" marker — strip them.
 */
function originalSlug(cartSlug) {
  if (typeof cartSlug !== "string") return "";
  return cartSlug.split("__")[0];
}

// ─────────────────────────────────────────────────────────────────────
// Quote: recompute totals from server-side data.
// ─────────────────────────────────────────────────────────────────────

/**
 * Build a verified quote from the cart the browser sent. We trust:
 *   - the slug (used to look up the canonical product)
 *   - the quantity
 *   - the personalisation payload (it's typed by the user)
 *
 * We DO NOT trust:
 *   - the price (recomputed from the product doc)
 *   - any "isComboItem" flag (we re-derive from the slug suffix)
 *
 * Returns { lineItems, subtotalPaise, comboDiscountPaise, shippingPaise,
 *           taxPaise, discountCodePaise, totalPaise, currency }.
 */
export async function quoteFromCart(rawCart, options = {}) {
  await connectToDatabase();
  const cart = Array.isArray(rawCart) ? rawCart : [];
  if (cart.length === 0) {
    throw Object.assign(new Error("Cart is empty"), { code: "EMPTY_CART" });
  }

  // Look up every distinct product in one query.
  const slugSet = new Set(cart.map((c) => originalSlug(c.slug)).filter(Boolean));
  const products = await Product.find({
    slug: { $in: [...slugSet] },
    status: "active",
  }).lean();
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const lineItems = [];
  let subtotalPaise = 0;
  let comboCount = 0;
  let comboPriceTotalPaise = 0;

  for (const entry of cart) {
    const isCombo = typeof entry.slug === "string" && entry.slug.endsWith("__combo");
    const slug = originalSlug(entry.slug);
    const product = bySlug.get(slug);
    if (!product) {
      throw Object.assign(
        new Error(`Product unavailable: ${slug || "(unknown)"}`),
        { code: "PRODUCT_UNAVAILABLE", slug }
      );
    }
    const quantity = Math.max(1, Math.min(99, parseInt(entry.quantity, 10) || 1));
    const unitPaise = product.price; // already paise
    if (typeof unitPaise !== "number" || unitPaise < 0) {
      throw Object.assign(
        new Error(`Invalid product price for ${slug}`),
        { code: "INVALID_PRICE" }
      );
    }

    // Personalisation fee — flat ₹500 per personalised line item, the
    // same amount the cart UI adds when the customer fills the name.
    // We deliberately use a constant here rather than reading from
    // `product.personalisation.additionalFee` because every product
    // is treated as personalisable on the storefront, regardless of
    // catalog flags.
    const personalisationFee = entry?.personalisation?.isPersonalised
      ? PERSONALISATION_FEE_PAISE
      : 0;

    const variant = product.variants?.[0];
    lineItems.push({
      productId: product._id,
      productSlug: product.slug,
      productTitle: product.title,
      variantId: variant?._id,
      sku: variant?.sku,
      quantity,
      price: unitPaise,
      personalisationFee,
      personalisation: entry?.personalisation
        ? {
            name: String(entry.personalisation.name || "").slice(0, 60),
            font: String(entry.personalisation.font || "").slice(0, 60),
            school: String(entry.personalisation.school || "").slice(0, 100) || undefined,
          }
        : undefined,
      isComboItem: isCombo,
    });

    const lineGross = (unitPaise + personalisationFee) * quantity;
    subtotalPaise += lineGross;
    if (isCombo) {
      comboCount += quantity;
      comboPriceTotalPaise += lineGross;
    }
  }

  // Combo discount: % of combo-items subtotal only.
  const comboPct = comboDiscountPercent(comboCount);
  const comboDiscountPaise = Math.round(comboPriceTotalPaise * (comboPct / 100));

  // Discount code (additive, on top of combo discount).
  let discountCodePaise = 0;
  let appliedDiscountCode = null;
  if (options.discountCode) {
    const code = String(options.discountCode).trim().toUpperCase();
    const config = VALID_DISCOUNT_CODES[code];
    if (config) {
      if (config.type === "percentage") {
        const base = Math.max(0, subtotalPaise - comboDiscountPaise);
        discountCodePaise = Math.round(base * (config.value / 100));
        appliedDiscountCode = code;
      }
    }
  }

  // Shipping: Standard is free, Express is a flat surcharge. We only
  // bill shipping once the customer has entered a valid address (the
  // same gate the storefront uses to reveal the shipping options).
  const shippingMethod = options.shippingMethod === "express" ? "express" : "standard";
  let shippingPaise = 0;
  const pin = String(options.postalCode || "").replace(/\D/g, "");
  if (pin.length === 6 && shippingMethod === "express") {
    shippingPaise = EXPRESS_SHIPPING_PAISE;
  }

  // Tax is informational (already-inclusive). We expose it but don't
  // add it to the total.
  const taxPaise = Math.round(
    (subtotalPaise - comboDiscountPaise - discountCodePaise) * TAX_RATE
  );

  const totalPaise = Math.max(
    0,
    subtotalPaise - comboDiscountPaise - discountCodePaise + shippingPaise
  );

  return {
    lineItems,
    subtotalPaise,
    comboDiscountPaise,
    discountCodePaise,
    appliedDiscountCode,
    shippingPaise,
    shippingMethod,
    taxPaise,
    totalPaise,
    currency: "INR",
  };
}

// ─────────────────────────────────────────────────────────────────────
// Razorpay client
// ─────────────────────────────────────────────────────────────────────

let _razorpay = null;
async function getRazorpayClient() {
  if (_razorpay) return _razorpay;
  const Razorpay = (await import("razorpay")).default;
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw Object.assign(
      new Error("Razorpay is not configured"),
      { code: "RAZORPAY_NOT_CONFIGURED" }
    );
  }
  _razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  return _razorpay;
}

function razorpayMode() {
  return /^rzp_live_/.test(process.env.RAZORPAY_KEY_ID || "")
    ? "live"
    : "test";
}

// ─────────────────────────────────────────────────────────────────────
// Place an order: persist a pending Order + create a Razorpay order.
// ─────────────────────────────────────────────────────────────────────

export async function createPendingOrder(input) {
  const {
    cart,
    contact,
    delivery,
    billing,
    discountCode,
    shippingMethod,
  } = input;

  const quote = await quoteFromCart(cart, {
    discountCode,
    postalCode: delivery?.pinCode,
    shippingMethod,
  });

  // Build address subdocs in the shape the Order schema expects.
  const shippingAddress = {
    name: `${delivery?.firstName || ""} ${delivery?.lastName || ""}`.trim(),
    phone: delivery?.phone || "",
    line1: delivery?.address || "",
    line2: delivery?.apartment || "",
    city: delivery?.city || "",
    state: delivery?.state || "",
    postalCode: delivery?.pinCode || "",
    country: delivery?.country || "IN",
  };
  const billingAddress = billing
    ? {
        name: `${billing.firstName || ""} ${billing.lastName || ""}`.trim(),
        phone: billing.phone || delivery?.phone || "",
        line1: billing.address || "",
        line2: billing.apartment || "",
        city: billing.city || "",
        state: billing.state || "",
        postalCode: billing.pinCode || "",
        country: billing.country || "IN",
      }
    : shippingAddress;

  // Race-safe order number (unique index on Order.orderNumber).
  let orderNumber;
  for (let attempt = 0; attempt < 5; attempt++) {
    orderNumber = generateOrderNumber();
    const exists = await Order.findOne({ orderNumber }).select("_id").lean();
    if (!exists) break;
  }

  // Create the Razorpay order first; we want to bail out cheaply if their
  // API rejects our payload before mutating the database.
  const razorpay = await getRazorpayClient();
  const rzpOrder = await razorpay.orders.create({
    amount: quote.totalPaise,
    currency: quote.currency,
    receipt: orderNumber,
    notes: {
      orderNumber,
      customerEmail: contact?.email || "",
      itemCount: String(quote.lineItems.length),
    },
  });

  // Now persist the Order document with status = pending.
  const order = await Order.create({
    orderNumber,
    customerEmail: contact?.email,
    customerName: shippingAddress.name || undefined,
    customerPhone: contact?.phone || delivery?.phone,

    lineItems: quote.lineItems.map((li) => ({
      productId: li.productId,
      productSlug: li.productSlug,
      productTitle: li.productTitle,
      variantId: li.variantId,
      sku: li.sku,
      quantity: li.quantity,
      fulfilledQuantity: 0,
      price: li.price,
      personalisationFee: li.personalisationFee || 0,
      personalisation: li.personalisation,
    })),

    subtotal: quote.subtotalPaise,
    shipping: quote.shippingPaise,
    shippingMethod: quote.shippingMethod,
    consents: {
      whatsappSmsUpdates: !!contact?.whatsappUpdates,
      emailOffers: !!contact?.emailOffers,
      textOffers: !!delivery?.textOffers,
    },
    tax: quote.taxPaise,
    discount: quote.comboDiscountPaise + quote.discountCodePaise,
    total: quote.totalPaise,
    currency: quote.currency,

    discountCode: quote.appliedDiscountCode,

    shippingAddress,
    billingAddress,

    paymentStatus: "pending",
    fulfilmentStatus: "unfulfilled",

    razorpayOrderId: rzpOrder.id,
    razorpayMode: razorpayMode(),
  });

  return {
    orderId: String(order._id),
    orderNumber: order.orderNumber,
    razorpayOrderId: rzpOrder.id,
    razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
    amountPaise: quote.totalPaise,
    currency: quote.currency,
    quote,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Verify a Razorpay payment (called by the browser after Checkout closes)
// ─────────────────────────────────────────────────────────────────────

export function verifyRazorpaySignature({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) {
  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !process.env.RAZORPAY_KEY_SECRET
  ) {
    return false;
  }
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");
  // Constant-time compare so we don't leak signature bytes.
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(razorpay_signature, "utf8")
    );
  } catch {
    return false;
  }
}

/**
 * Mark an order paid and run all post-payment side-effects:
 *   - decrement variant inventory
 *   - touch the Customer document (lifetime spend, last order)
 *
 * Idempotent: if the order is already `paid`, returns the existing
 * record without mutating anything (handles Razorpay retrying the
 * webhook or the user double-clicking the success handler).
 */
export async function markOrderPaid({
  razorpayOrderId,
  razorpayPaymentId,
}) {
  await connectToDatabase();
  const order = await Order.findOne({ razorpayOrderId });
  if (!order) {
    throw Object.assign(new Error("Order not found"), { code: "NOT_FOUND" });
  }

  if (order.paymentStatus === "paid") {
    return { order, alreadyPaid: true };
  }

  order.paymentStatus = "paid";
  if (razorpayPaymentId) order.razorpayPaymentId = razorpayPaymentId;
  await order.save();

  // ── Order-confirmation email (fire-and-forget) ──
  // Runs for BOTH test and live orders so the flow can be verified
  // end-to-end. Non-fatal: the payment is already persisted. Log
  // errors but never throw so the verify-payment endpoint returns 200.
  try {
    const { sendOrderConfirmationEmail } = await import(
      "../email/order-confirmation.js"
    );
    await sendOrderConfirmationEmail(order);
  } catch (err) {
    console.error("[checkout] order confirmation email failed", err);
  }

  // ── Production-only side effects ──
  // Test-mode orders still get persisted so the admin can review the
  // checkout flow end-to-end, but they MUST NOT mutate inventory or
  // customer aggregates that the live business depends on.
  const isTestOrder = order.razorpayMode === "test";
  if (isTestOrder) {
    return { order, alreadyPaid: false, sideEffectsSkipped: true };
  }

  // Decrement inventory in best-effort fashion. Failures don't undo the
  // payment — that's a recoverable backend issue.
  try {
    for (const li of order.lineItems) {
      if (!li.productId || !li.variantId) continue;
      await Product.updateOne(
        { _id: li.productId, "variants._id": li.variantId },
        {
          $inc: { "variants.$.inventory": -li.quantity },
        }
      );
    }
  } catch (err) {
    console.error("[checkout] inventory decrement failed", err);
  }

  // Customer aggregate: create or update by email.
  try {
    if (order.customerEmail) {
      const existing = await Customer.findOne({ email: order.customerEmail });
      if (existing) {
        existing.totalSpent = (existing.totalSpent || 0) + order.total;
        existing.totalOrders = (existing.totalOrders || 0) + 1;
        existing.lastOrderAt = new Date();
        if (!existing.name && order.customerName) existing.name = order.customerName;
        if (!existing.phone && order.customerPhone) existing.phone = order.customerPhone;
        await existing.save();
        order.customerId = existing._id;
        await order.save();
      } else {
        const created = await Customer.create({
          email: order.customerEmail,
          name: order.customerName,
          phone: order.customerPhone,
          totalSpent: order.total,
          totalOrders: 1,
          lastOrderAt: new Date(),
          addresses: order.shippingAddress
            ? [{ ...order.shippingAddress, label: "Home", isDefault: true }]
            : [],
        });
        order.customerId = created._id;
        await order.save();
      }
    }
  } catch (err) {
    console.error("[checkout] customer upsert failed", err);
  }

  return { order, alreadyPaid: false };
}

/**
 * Mark an order failed. Used when the browser-side handler returns a
 * payment failure or the user dismisses the modal after starting a
 * payment.
 */
export async function markOrderFailed({ razorpayOrderId, reason }) {
  await connectToDatabase();
  const order = await Order.findOne({ razorpayOrderId });
  if (!order) return null;
  if (order.paymentStatus === "paid") return order; // never undo a paid order
  order.paymentStatus = "failed";
  if (reason) {
    order.notes.push({ text: `Payment failed: ${String(reason).slice(0, 500)}` });
  }
  await order.save();
  return order;
}
