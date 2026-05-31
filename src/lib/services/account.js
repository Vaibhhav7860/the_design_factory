/**
 * Customer-facing account service.
 *
 * The User collection holds auth credentials. The Customer collection
 * (created by the seed/checkout flows) holds order-derived aggregates
 * + addresses. We bridge them by email here so the storefront's account
 * pages can show profile, orders, addresses, and lifetime stats from
 * one call.
 */
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectToDatabase } from "../db/mongoose.js";
import { User } from "../db/models/User.js";
import { Customer } from "../db/models/Customer.js";
import { Order } from "../db/models/Order.js";

const BCRYPT_COST = 12;

// ────────────────────────────────────────────────────────────────────
// Schemas
// ────────────────────────────────────────────────────────────────────

export const ProfileUpdateSchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-]{7,20}$/, "Enter a valid phone number")
    .or(z.literal("")),
});

export const AddressSchema = z.object({
  label: z.string().trim().max(40).optional().or(z.literal("")),
  name: z.string().trim().min(1).max(100),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-]{7,20}$/, "Enter a valid phone number"),
  line1: z.string().trim().min(1).max(200),
  line2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(1).max(80),
  state: z.string().trim().min(1).max(80),
  postalCode: z.string().regex(/^\d{6}$/, "PIN code must be 6 digits"),
  country: z.string().trim().max(60).default("IN"),
  isDefault: z.boolean().optional(),
});

export const PasswordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(200),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

// ────────────────────────────────────────────────────────────────────
// Read
// ────────────────────────────────────────────────────────────────────

/**
 * Compose the full profile dashboard payload for a signed-in customer.
 * Returns null if the user can't be located.
 */
export async function getAccountSnapshot(email) {
  if (!email) return null;
  const lower = String(email).trim().toLowerCase();
  if (!lower) return null;

  await connectToDatabase();
  const [user, customer, recentOrders, totalCount] = await Promise.all([
    User.findOne({ email: lower }).lean(),
    Customer.findOne({ email: lower }).lean(),
    Order.find({ customerEmail: lower })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Order.countDocuments({ customerEmail: lower }),
  ]);

  if (!user) return null;

  const lifetimeSpend =
    customer?.totalSpent ??
    recentOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  return {
    user: {
      id: String(user._id),
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      name: user.name || "",
      phone: user.phone || customer?.phone || "",
      image: user.image || null,
      hasPassword: Boolean(user.passwordHash),
      googleLinked: Boolean(user.googleId),
      createdAt: user.createdAt
        ? new Date(user.createdAt).toISOString()
        : null,
      lastLoginAt: user.lastLoginAt
        ? new Date(user.lastLoginAt).toISOString()
        : null,
    },
    stats: {
      totalOrders: totalCount,
      lifetimeSpend, // paise
      lastOrderAt: customer?.lastOrderAt
        ? new Date(customer.lastOrderAt).toISOString()
        : null,
      acceptsMarketing: customer?.acceptsMarketing ?? false,
    },
    addresses: (customer?.addresses || []).map((a) => ({
      id: String(a._id),
      label: a.label || "",
      name: a.name || "",
      phone: a.phone || "",
      line1: a.line1 || "",
      line2: a.line2 || "",
      city: a.city || "",
      state: a.state || "",
      postalCode: a.postalCode || "",
      country: a.country || "IN",
      isDefault: !!a.isDefault,
    })),
    recentOrders: recentOrders.map(serialiseOrder),
  };
}

export async function getOrdersForCustomer(email, { limit = 50 } = {}) {
  if (!email) return [];
  await connectToDatabase();
  const orders = await Order.find({
    customerEmail: String(email).trim().toLowerCase(),
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return orders.map(serialiseOrder);
}

export async function getOrderForCustomer(email, orderNumber) {
  if (!email || !orderNumber) return null;
  await connectToDatabase();
  const order = await Order.findOne({
    customerEmail: String(email).trim().toLowerCase(),
    orderNumber: String(orderNumber).trim(),
  }).lean();
  if (!order) return null;
  return serialiseOrder(order, { full: true });
}

function serialiseOrder(o, { full = false } = {}) {
  const base = {
    id: String(o._id),
    orderNumber: o.orderNumber,
    createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : null,
    paymentStatus: o.paymentStatus,
    fulfilmentStatus: o.fulfilmentStatus,
    total: o.total ?? 0,
    subtotal: o.subtotal ?? 0,
    shipping: o.shipping ?? 0,
    tax: o.tax ?? 0,
    discount: o.discount ?? 0,
    currency: o.currency || "INR",
    itemCount: (o.lineItems || []).reduce(
      (sum, li) => sum + (li.quantity || 0),
      0
    ),
    coverImage: null, // populated on demand by the consumer
    lineItems: (o.lineItems || []).map((li) => ({
      productSlug: li.productSlug,
      productTitle: li.productTitle,
      quantity: li.quantity,
      price: li.price,
      personalisationFee: li.personalisationFee || 0,
      personalisation: li.personalisation || null,
    })),
  };
  if (full) {
    base.shippingAddress = o.shippingAddress || null;
    base.billingAddress = o.billingAddress || null;
    base.razorpayPaymentId = o.razorpayPaymentId || null;
  }
  return base;
}

// ────────────────────────────────────────────────────────────────────
// Update
// ────────────────────────────────────────────────────────────────────

export async function updateProfile(email, input) {
  const parsed = ProfileUpdateSchema.parse(input);
  await connectToDatabase();
  const lower = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: lower });
  if (!user) throw Object.assign(new Error("User not found"), { code: "NOT_FOUND" });

  user.firstName = parsed.firstName;
  user.lastName = parsed.lastName;
  user.name = `${parsed.firstName} ${parsed.lastName}`.trim();
  user.phone = parsed.phone || undefined;
  await user.save();

  // Mirror the phone onto the Customer aggregate so checkout pre-fills work
  if (parsed.phone) {
    await Customer.updateOne(
      { email: lower },
      { $set: { phone: parsed.phone, name: user.name } },
      { upsert: false }
    );
  }

  return {
    firstName: user.firstName,
    lastName: user.lastName,
    name: user.name,
    phone: user.phone || "",
  };
}

export async function changePassword(email, input) {
  const parsed = PasswordChangeSchema.parse(input);
  await connectToDatabase();
  const lower = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: lower }).select("+passwordHash");
  if (!user) throw Object.assign(new Error("User not found"), { code: "NOT_FOUND" });

  if (!user.passwordHash) {
    // Google-only account — promote them by setting a password.
    user.passwordHash = await bcrypt.hash(parsed.newPassword, BCRYPT_COST);
    await user.save();
    return { ok: true, setForFirstTime: true };
  }

  const ok = await bcrypt.compare(parsed.currentPassword, user.passwordHash);
  if (!ok) {
    throw Object.assign(new Error("Your current password is incorrect."), {
      code: "BAD_CURRENT_PASSWORD",
    });
  }

  user.passwordHash = await bcrypt.hash(parsed.newPassword, BCRYPT_COST);
  await user.save();
  return { ok: true };
}

// ────────────────────────────────────────────────────────────────────
// Addresses (live on the Customer document)
// ────────────────────────────────────────────────────────────────────

async function getOrCreateCustomer(email, { user } = {}) {
  const lower = String(email).trim().toLowerCase();
  let customer = await Customer.findOne({ email: lower });
  if (!customer) {
    customer = await Customer.create({
      email: lower,
      name: user?.name,
      phone: user?.phone,
      addresses: [],
    });
  }
  return customer;
}

export async function addAddress(email, input) {
  const parsed = AddressSchema.parse(input);
  await connectToDatabase();
  const lower = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: lower }).lean();
  const customer = await getOrCreateCustomer(lower, { user });

  if (parsed.isDefault) {
    customer.addresses.forEach((a) => (a.isDefault = false));
  } else if (customer.addresses.length === 0) {
    parsed.isDefault = true;
  }

  customer.addresses.push(parsed);
  await customer.save();
  return customer.addresses[customer.addresses.length - 1].toObject();
}

export async function updateAddress(email, addressId, input) {
  const parsed = AddressSchema.parse(input);
  await connectToDatabase();
  const lower = String(email).trim().toLowerCase();
  const customer = await Customer.findOne({ email: lower });
  if (!customer)
    throw Object.assign(new Error("Customer not found"), { code: "NOT_FOUND" });

  const target = customer.addresses.id(addressId);
  if (!target)
    throw Object.assign(new Error("Address not found"), { code: "NOT_FOUND" });

  if (parsed.isDefault) {
    customer.addresses.forEach((a) => (a.isDefault = false));
  }

  target.set(parsed);
  await customer.save();
  return target.toObject();
}

export async function deleteAddress(email, addressId) {
  await connectToDatabase();
  const lower = String(email).trim().toLowerCase();
  const customer = await Customer.findOne({ email: lower });
  if (!customer)
    throw Object.assign(new Error("Customer not found"), { code: "NOT_FOUND" });

  const target = customer.addresses.id(addressId);
  if (!target)
    throw Object.assign(new Error("Address not found"), { code: "NOT_FOUND" });

  const wasDefault = target.isDefault;
  customer.addresses.pull(addressId);

  // If we removed the default and another address remains, promote the first.
  if (wasDefault && customer.addresses.length > 0) {
    customer.addresses[0].isDefault = true;
  }
  await customer.save();
  return { ok: true };
}

export async function setDefaultAddress(email, addressId) {
  await connectToDatabase();
  const lower = String(email).trim().toLowerCase();
  const customer = await Customer.findOne({ email: lower });
  if (!customer)
    throw Object.assign(new Error("Customer not found"), { code: "NOT_FOUND" });
  let touched = false;
  customer.addresses.forEach((a) => {
    const next = String(a._id) === String(addressId);
    if (a.isDefault !== next) touched = true;
    a.isDefault = next;
  });
  if (touched) await customer.save();
  return { ok: true };
}

// ────────────────────────────────────────────────────────────────────
// Marketing preferences
// ────────────────────────────────────────────────────────────────────

export async function setMarketingPreference(email, accepts) {
  await connectToDatabase();
  const lower = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: lower }).lean();
  const customer = await getOrCreateCustomer(lower, { user });
  customer.acceptsMarketing = !!accepts;
  await customer.save();
  return { ok: true, acceptsMarketing: customer.acceptsMarketing };
}
