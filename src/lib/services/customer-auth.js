/**
 * Customer-account service.
 *
 * Sign-up, password reset request, password reset confirm. All three
 * are exercised by the storefront pages under /account/*.
 */
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectToDatabase } from "../db/mongoose.js";
import { User } from "../db/models/User.js";
import { sendEmail, buildPasswordResetEmail } from "../email.js";

const BCRYPT_COST = 12;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 60 minutes

// ────────────────────────────────────────────────────────────────────
// Schemas
// ────────────────────────────────────────────────────────────────────

export const SignUpSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required").max(60),
    lastName: z.string().trim().min(1, "Last name is required").max(60),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    phone: z
      .string()
      .trim()
      .regex(
        /^\+?[\d\s-]{7,20}$/,
        "Enter a valid phone number"
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(200),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const ForgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const ResetPasswordSchema = z
  .object({
    token: z.string().trim().min(20).max(200),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(200),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────

function appUrl() {
  return (
    process.env.APP_URL?.replace(/\/+$/, "") ||
    process.env.NEXTAUTH_URL?.replace(/\/+$/, "") ||
    "http://localhost:3000"
  );
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function safeFullName(firstName, lastName) {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || undefined;
}

// ────────────────────────────────────────────────────────────────────
// Sign-up
// ────────────────────────────────────────────────────────────────────

export async function signUpCustomer(input) {
  const parsed = SignUpSchema.parse(input);
  await connectToDatabase();

  const existing = await User.findOne({ email: parsed.email }).select(
    "+passwordHash"
  );
  if (existing) {
    // Two cases:
    //  1. Already has a password → outright duplicate.
    //  2. Was created via Google → let them set a password and merge.
    if (existing.passwordHash) {
      const err = new Error("An account with this email already exists.");
      err.code = "EMAIL_TAKEN";
      throw err;
    }
    existing.firstName = existing.firstName || parsed.firstName;
    existing.lastName = existing.lastName || parsed.lastName;
    existing.phone = existing.phone || parsed.phone;
    existing.name =
      existing.name || safeFullName(parsed.firstName, parsed.lastName);
    existing.passwordHash = await bcrypt.hash(parsed.password, BCRYPT_COST);
    existing.role = existing.role || "customer";
    await existing.save();
    return {
      id: String(existing._id),
      email: existing.email,
      name: existing.name,
      mergedFromGoogle: true,
    };
  }

  const passwordHash = await bcrypt.hash(parsed.password, BCRYPT_COST);
  const created = await User.create({
    firstName: parsed.firstName,
    lastName: parsed.lastName,
    name: safeFullName(parsed.firstName, parsed.lastName),
    email: parsed.email,
    phone: parsed.phone,
    passwordHash,
    role: "customer",
    isActive: true,
  });

  return {
    id: String(created._id),
    email: created.email,
    name: created.name,
  };
}

// ────────────────────────────────────────────────────────────────────
// Forgot-password
// ────────────────────────────────────────────────────────────────────

/**
 * Always returns success — we never reveal whether an email is on file.
 * If the user exists and has a password, we mint a token and email a
 * link. If they signed up only with Google we still pretend to send so
 * an attacker can't enumerate accounts.
 */
export async function requestPasswordReset(input) {
  const parsed = ForgotPasswordSchema.parse(input);
  await connectToDatabase();

  const user = await User.findOne({ email: parsed.email }).select(
    "+passwordResetToken +passwordResetExpiresAt"
  );
  if (!user || !user.passwordHash) {
    // Pretend we sent something; still return ok.
    return { ok: true };
  }

  // Generate a 32-byte random token; store SHA-256(token), email plain
  // token. This way a DB leak doesn't expose live reset URLs.
  const rawToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = hashToken(rawToken);
  user.passwordResetExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await user.save();

  const resetUrl = `${appUrl()}/account/reset-password?token=${encodeURIComponent(
    rawToken
  )}`;

  const { subject, html, text } = buildPasswordResetEmail({
    name: user.firstName || user.name,
    resetUrl,
  });

  try {
    await sendEmail({ to: user.email, subject, html, text });
  } catch (err) {
    // Surface, but don't fail the user-facing request.
    console.error("[customer-auth] reset email failed", err);
  }

  return { ok: true };
}

// ────────────────────────────────────────────────────────────────────
// Reset-password
// ────────────────────────────────────────────────────────────────────

export async function resetPassword(input) {
  const parsed = ResetPasswordSchema.parse(input);
  await connectToDatabase();

  const hashed = hashToken(parsed.token);
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpiresAt: { $gt: new Date() },
  }).select("+passwordHash +passwordResetToken +passwordResetExpiresAt");

  if (!user) {
    const err = new Error(
      "This password reset link is no longer valid. Please request a new one."
    );
    err.code = "TOKEN_INVALID";
    throw err;
  }

  user.passwordHash = await bcrypt.hash(parsed.password, BCRYPT_COST);
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;
  user.failedAttempts = 0;
  user.failedAttemptsResetAt = undefined;
  user.lockedUntil = undefined;
  await user.save();

  return {
    ok: true,
    email: user.email,
  };
}
