import mongoose from "mongoose";

/**
 * Permissions list — every granular capability flag.
 * Admin role gets all of these automatically; Staff role gets only the
 * subset assigned by an admin.
 */
export const PERMISSIONS = [
  "dashboard.view",
  "orders.read",
  "orders.write",
  "orders.refund",
  "products.read",
  "products.write",
  "categories.write",
  "customers.read",
  "customers.write",
  "discounts.write",
  "marketing.write",
  "content.write",
  "navigation.write",
  "theme.write",
  "apps.write",
  "reports.view",
  "files.write",
  "bulk_enquiries.read",
  "bulk_enquiries.write",
  "settings.write",
  "staff.write",
  "markets.write",
];

export const ROLES = ["admin", "staff", "customer"];

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
    },
    passwordHash: { type: String, select: false },
    role: { type: String, enum: ROLES, default: "customer", index: true },
    permissions: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.every((p) => PERMISSIONS.includes(p)),
        message: "Invalid permission flag",
      },
    },
    isActive: { type: Boolean, default: true, index: true },

    // MFA
    mfaEnabled: { type: Boolean, default: false },
    mfaSecret: { type: String, select: false },
    mfaRecoveryCodes: { type: [String], select: false, default: [] },

    // Lockout / failed-attempt tracking (Req 1 clauses 13, 15)
    failedAttempts: { type: Number, default: 0 },
    failedAttemptsResetAt: { type: Date },
    lockedUntil: { type: Date },

    // Password reset
    passwordResetToken: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },

    // Audit
    lastLoginAt: { type: Date },
    lastLoginIp: { type: String },
  },
  { timestamps: true }
);

UserSchema.methods.hasPermission = function (perm) {
  if (this.role === "admin") return true;
  return this.permissions?.includes(perm) ?? false;
};

export const User =
  mongoose.models.User || mongoose.model("User", UserSchema);
