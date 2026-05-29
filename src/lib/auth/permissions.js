import { auth } from "./config.js";

export class AuthError extends Error {
  constructor(message, status = 401) {
    super(message);
    this.status = status;
  }
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    throw new AuthError("Authentication required", 401);
  }
  if (session.user.role !== "admin" && session.user.role !== "staff") {
    throw new AuthError("Forbidden", 403);
  }
  return session;
}

export async function requirePermission(permission) {
  const session = await requireSession();
  if (session.user.role === "admin") return session;
  if (!session.user.permissions?.includes(permission)) {
    throw new AuthError(`Permission required: ${permission}`, 403);
  }
  return session;
}

/**
 * Wraps a route handler so that auth errors become structured JSON responses.
 */
export function adminRoute(handler) {
  return async (request, ctx) => {
    try {
      return await handler(request, ctx);
    } catch (err) {
      if (err instanceof AuthError) {
        return Response.json(
          { error: err.message },
          { status: err.status }
        );
      }
      console.error("[adminRoute] unhandled", err);
      return Response.json(
        { error: err.message || "Internal server error" },
        { status: err.status || 500 }
      );
    }
  };
}
