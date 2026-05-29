import mongoose from "mongoose";

const BulkEnquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    quantityRange: String,
    message: { type: String, maxlength: 5000 },
    status: {
      type: String,
      enum: ["new", "in_progress", "quoted", "closed"],
      default: "new",
      index: true,
    },
    responseNote: String,
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

BulkEnquirySchema.index({ createdAt: -1 });

export const BulkEnquiry =
  mongoose.models.BulkEnquiry || mongoose.model("BulkEnquiry", BulkEnquirySchema);

const NewsletterSubscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    sourcePage: String,
    isUnsubscribed: { type: Boolean, default: false, index: true },
    unsubscribedAt: Date,
  },
  { timestamps: true }
);

export const NewsletterSubscriber =
  mongoose.models.NewsletterSubscriber || mongoose.model("NewsletterSubscriber", NewsletterSubscriberSchema);
