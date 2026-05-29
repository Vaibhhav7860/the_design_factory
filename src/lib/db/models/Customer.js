import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    label: String,
    name: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: "IN" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const CustomerSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    name: String,
    phone: String,

    addresses: { type: [AddressSchema], default: [] },

    totalSpent: { type: Number, default: 0 }, // paise lifetime
    totalOrders: { type: Number, default: 0 },
    lastOrderAt: Date,

    tags: { type: [String], default: [], index: true },
    notes: String,

    acceptsMarketing: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Customer =
  mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
