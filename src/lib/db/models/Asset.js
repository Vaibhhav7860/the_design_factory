import mongoose from "mongoose";

const AssetSchema = new mongoose.Schema(
  {
    objectKey: { type: String, required: true, unique: true, index: true },
    bucket: { type: String, required: true },
    filename: String,
    mimeType: String,
    size: Number, // bytes
    width: Number,
    height: Number,
    durationSec: Number, // for videos
    publicUrl: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    referenceCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Asset =
  mongoose.models.Asset || mongoose.model("Asset", AssetSchema);
