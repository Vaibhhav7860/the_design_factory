import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    actorEmail: String,
    actorRole: String,
    action: { type: String, required: true, index: true },
    targetType: { type: String, index: true },
    targetId: String,
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    ip: String,
    userAgent: String,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ actorId: 1, createdAt: -1 });

export const AuditLog =
  mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
