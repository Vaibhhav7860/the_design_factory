import NextAuth from "next-auth";
import { edgeAuthConfig } from "./edge-config.js";

/**
 * Edge-runtime instance — used exclusively from middleware (proxy.js).
 * Validates the JWT cookie without touching MongoDB or bcrypt.
 */
export const { auth: edgeAuth } = NextAuth(edgeAuthConfig);
