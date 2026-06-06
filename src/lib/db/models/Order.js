import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: "IN" },
  },
  { _id: false }
);

const PersonalisationPayloadSchema = new mongoose.Schema(
  {
    name: String,
    school: String,
    font: String,
  },
  { _id: false }
);

const LineItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productSlug: String,
    productTitle: String,
    variantId: { type: mongoose.Schema.Types.ObjectId },
    sku: String,
    quantity: { type: Number, min: 1, required: true },
    fulfilledQuantity: { type: Number, default: 0 },
    price: { type: Number, required: true }, // paise per unit at order time
    personalisationFee: { type: Number, default: 0 }, // paise
    personalisation: PersonalisationPayloadSchema,
    lockToken: String, // for fulfilment concurrency
    lockExpiresAt: Date,
  },
  { _id: true }
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      index: true,
    },
    customerEmail: { type: String, index: true },
    customerName: String,
    customerPhone: String,

    lineItems: { type: [LineItemSchema], default: [] },

    subtotal: Number, // paise
    shipping: Number, // paise
    shippingMethod: {
      type: String,
      enum: ["standard", "express"],
      default: "standard",
    },
    tax: Number, // paise
    discount: Number, // paise
    total: Number, // paise
    currency: { type: String, default: "INR" },

    discountCode: String,

    shippingAddress: AddressSchema,
    billingAddress: AddressSchema,

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
      default: "pending",
      index: true,
    },
    fulfilmentStatus: {
      type: String,
      enum: ["unfulfilled", "partial", "fulfilled", "cancelled"],
      default: "unfulfilled",
      index: true,
    },

    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpayMode: { type: String, enum: ["test", "live"] },

    tags: { type: [String], default: [] },

    notes: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    cancelledAt: Date,
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cancellationReason: String,
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });

export const Order =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);
