import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "../db/mongoose.js";
import { User } from "../db/models/User.js";
import { edgeAuthConfig } from "./edge-config.js";
import { verifyTOTP } from "./totp.js";

/**
 * Full Node-runtime NextAuth configuration.
 *
 * Extends the edge-safe config with the Credentials provider that does
 * bcrypt password verification, account-lockout tracking and TOTP MFA.
 * This file MUST NOT be imported from middleware — middleware uses
 * `./edge-config.js` instead.
 */

const LOCKOUT_MAX_ATTEMPTS = 10;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000;
const ATTEMPTS_WINDOW_MS = 60 * 60 * 1000;

export const authConfig = {
  ...edgeAuthConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
        totp: {},
      },
      async authorize(credentials) {
        try {
          await connectToDatabase();
          const email = String(credentials?.email || "").trim().toLowerCase();
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
          };
        } catch (err) {
          console.error("[auth.authorize] error", err);
          return null;
        }
      },
    }),
  ],
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
