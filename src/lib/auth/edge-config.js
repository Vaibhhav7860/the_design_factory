/**
 * Edge-safe NextAuth config.
 *
 * Used by middleware (Edge Runtime). It does NOT import the bcrypt or
 * MongoDB-touching parts — those live in `./config.js` and are only loaded
 * at the Node runtime where they're allowed.
 */

const ABSOLUTE_SESSION_SECONDS = 12 * 60 * 60; // 12 hours
const IDLE_THRESHOLD_SECONDS = 60 * 60; // 60 minutes

export const edgeAuthConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: ABSOLUTE_SESSION_SECONDS,
  },
  // No providers here — providers are added in the full config used at the
  // Node runtime. The edge bundle only needs to validate the JWT.
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.permissions = user.permissions || [];
        token.iat = Math.floor(Date.now() / 1000);
        token.lastActivityAt = Math.floor(Date.now() / 1000);
      }
      if (trigger !== undefined) {
        token.lastActivityAt = Math.floor(Date.now() / 1000);
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.permissions = token.permissions || [];
        session.lastActivityAt = token.lastActivityAt;
        session.absoluteExpiresAt = (token.iat || 0) + ABSOLUTE_SESSION_SECONDS;
      }
      return session;
    },
    async authorized({ auth, request }) {
      const url = request.nextUrl;
      // Admin area is gated. Everything else is public — customers
      // can browse without an account; gates on /account/* are enforced
      // inside the page (so redirect target preserves intent).
      if (url.pathname.startsWith("/admin") && !url.pathname.startsWith("/admin/login")) {
        if (!auth?.user) return false;
        const now = Math.floor(Date.now() / 1000);
        const idleAge = now - (auth.lastActivityAt || 0);
        if (idleAge > IDLE_THRESHOLD_SECONDS) return false;
        if (auth.absoluteExpiresAt && now > auth.absoluteExpiresAt) return false;
        if (auth.user.role !== "admin" && auth.user.role !== "staff") return false;
      }
      return true;
    },
  },
  trustHost: true,
};
