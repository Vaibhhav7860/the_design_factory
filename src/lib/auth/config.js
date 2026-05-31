import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "../db/mongoose.js";
import { User } from "../db/models/User.js";
import { edgeAuthConfig } from "./edge-config.js";
import { verifyTOTP } from "./totp.js";

/**
 * Full Node-runtime NextAuth configuration.
 *
 * Three sign-in paths:
 *   1. "credentials" — admin/staff sign-in (existing flow, gated by role +
 *      bcrypt + optional TOTP MFA). Used by /admin/login.
 *   2. "customer-credentials" — customer email+password sign-in. Same
 *      bcrypt verification, but no MFA, no role gate.
 *   3. "google" — OAuth flow used by storefront customers. Auto-creates
 *      a customer User if one with that email doesn't exist.
 *
 * Middleware uses the trimmed-down `edge-config.js` instead of this file.
 */

const LOCKOUT_MAX_ATTEMPTS = 10;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000;
const ATTEMPTS_WINDOW_MS = 60 * 60 * 1000;

export const authConfig = {
  ...edgeAuthConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Always show the account chooser so multi-account users land
      // on the right one.
      authorization: { params: { prompt: "select_account" } },
    }),

    // ── Admin / Staff sign-in (existing) ────────────────────────────
    Credentials({
      id: "credentials",
      name: "Admin credentials",
      credentials: { email: {}, password: {}, totp: {} },
      async authorize(credentials) {
        try {
          await connectToDatabase();
          const email = String(credentials?.email || "")
            .trim()
            .toLowerCase();
          const password = String(credentials?.password || "");
          const totp = String(credentials?.totp || "").trim();
          if (!email || !password) return null;

          const user = await User.findOne({ email })
            .select("+passwordHash +mfaSecret")
            .exec();
          if (!user) return null;
          if (user.lockedUntil && user.lockedUntil > new Date()) return null;
          if (user.role !== "admin" && user.role !== "staff") return null;
          if (!user.isActive) return null;
          if (!user.passwordHash) return null;

          const passwordOk = await bcrypt.compare(password, user.passwordHash);
          if (!passwordOk) {
            await registerFailedAttempt(user);
            return null;
          }

          if (user.mfaEnabled) {
            if (!totp || !user.mfaSecret) {
              await registerFailedAttempt(user);
              return null;
            }
            const ok = await verifyTOTP(user.mfaSecret, totp);
            if (!ok) {
              await registerFailedAttempt(user);
              return null;
            }
          }

          user.failedAttempts = 0;
          user.failedAttemptsResetAt = undefined;
          user.lockedUntil = undefined;
          user.lastLoginAt = new Date();
          await user.save();

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            permissions: user.permissions,
            image: user.image,
          };
        } catch (err) {
          console.error("[auth.credentials] error", err);
          return null;
        }
      },
    }),

    // ── Customer email+password sign-in ─────────────────────────────
    Credentials({
      id: "customer-credentials",
      name: "Customer credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        try {
          await connectToDatabase();
          const email = String(credentials?.email || "")
            .trim()
            .toLowerCase();
          const password = String(credentials?.password || "");
          if (!email || !password) return null;

          const user = await User.findOne({ email })
            .select("+passwordHash")
            .exec();
          if (!user) return null;
          if (!user.isActive) return null;
          if (user.lockedUntil && user.lockedUntil > new Date()) return null;
          if (!user.passwordHash) {
            // User signed up with Google only — they don't have a password.
            return null;
          }

          const passwordOk = await bcrypt.compare(password, user.passwordHash);
          if (!passwordOk) {
            await registerFailedAttempt(user);
            return null;
          }

          user.failedAttempts = 0;
          user.failedAttemptsResetAt = undefined;
          user.lockedUntil = undefined;
          user.lastLoginAt = new Date();
          await user.save();

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role || "customer",
            permissions: user.permissions || [],
            image: user.image,
          };
        } catch (err) {
          console.error("[auth.customer-credentials] error", err);
          return null;
        }
      },
    }),
  ],

  // Override the auth callbacks where we need DB-touching logic.
  callbacks: {
    ...edgeAuthConfig.callbacks,

    /**
     * Auto-create / link a User when someone signs in with Google.
     * Returns false to abort sign-in, true to proceed.
     */
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;
      try {
        await connectToDatabase();
        const email = String(user?.email || profile?.email || "")
          .trim()
          .toLowerCase();
        if (!email) return false;

        let dbUser = await User.findOne({ email });
        if (dbUser) {
          // Link the Google identity if it isn't already attached
          if (!dbUser.googleId && account.providerAccountId) {
            dbUser.googleId = String(account.providerAccountId);
          }
          if (!dbUser.image && (profile?.picture || user?.image)) {
            dbUser.image = profile?.picture || user?.image;
          }
          if (!dbUser.firstName && profile?.given_name) {
            dbUser.firstName = profile.given_name;
          }
          if (!dbUser.lastName && profile?.family_name) {
            dbUser.lastName = profile.family_name;
          }
          if (!dbUser.name && profile?.name) {
            dbUser.name = profile.name;
          }
          dbUser.emailVerified = dbUser.emailVerified || new Date();
          dbUser.lastLoginAt = new Date();
          await dbUser.save();
        } else {
          dbUser = await User.create({
            email,
            name: profile?.name || user?.name || email.split("@")[0],
            firstName: profile?.given_name || "",
            lastName: profile?.family_name || "",
            image: profile?.picture || user?.image || undefined,
            googleId: account.providerAccountId
              ? String(account.providerAccountId)
              : undefined,
            role: "customer",
            isActive: true,
            emailVerified: new Date(),
            lastLoginAt: new Date(),
          });
        }

        // Mirror the DB id back onto the NextAuth user object so the JWT
        // callback below stores it on the token.
        user.id = String(dbUser._id);
        user.role = dbUser.role;
        user.permissions = dbUser.permissions || [];
        user.image = dbUser.image;
        user.name = dbUser.name;
        return true;
      } catch (err) {
        console.error("[auth.signIn google] error", err);
        return false;
      }
    },
  },
};

async function registerFailedAttempt(user) {
  const now = new Date();
  const windowExpired =
    user.failedAttemptsResetAt &&
    now.getTime() - user.failedAttemptsResetAt.getTime() > ATTEMPTS_WINDOW_MS;

  if (!user.failedAttemptsResetAt || windowExpired) {
    user.failedAttempts = 1;
    user.failedAttemptsResetAt = now;
  } else {
    user.failedAttempts = (user.failedAttempts || 0) + 1;
  }

  if (user.failedAttempts >= LOCKOUT_MAX_ATTEMPTS) {
    user.lockedUntil = new Date(now.getTime() + LOCKOUT_DURATION_MS);
  }

  await user.save();
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
