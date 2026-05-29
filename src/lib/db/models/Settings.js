import mongoose from "mongoose";

/**
 * Singleton document holding store-wide settings.
 */
const SettingsSchema = new mongoose.Schema(
  {
    singletonKey: { type: String, default: "default", unique: true },

    storeName: { type: String, default: "The Design Factory" },
    storeEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    businessAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: { type: String, default: "IN" },
    },
    currency: { type: String, default: "INR" },
    bulkOrdersEmail: { type: String, default: "bulk@thedesignfactory.in" },
    lowStockNotificationEmail: { type: String, default: "" },

    taxRates: [
      {
        name: String,
        percent: Number,
        applicability: { type: String, enum: ["all", "categories"], default: "all" },
        categories: [String],
        isActive: { type: Boolean, default: true },
      },
    ],

    shippingZones: [
      {
        name: String,
        countries: [String],
        states: [String],
        rates: [
          {
            name: String,
            condition: { type: String, enum: ["weight", "subtotal"], default: "subtotal" },
            min: Number,
            max: Number,
            price: Number, // paise
          },
        ],
      },
    ],

    notificationTemplates: {
      orderConfirmation: { subject: String, body: String },
      fulfilment: { subject: String, body: String },
      refund: { subject: String, body: String },
      passwordReset: { subject: String, body: String },
      abandonedCart: { subject: String, body: String },
    },
  },
  { timestamps: true }
);

export const Settings =
  mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
