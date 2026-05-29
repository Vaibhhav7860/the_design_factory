import { NextResponse } from "next/server";
import { edgeAuth } from "@/lib/auth/edge";

/**
 * Edge proxy (formerly middleware.js in Next.js 15 and earlier).
 *
 * Gates /admin/* and /api/admin/* on a valid admin/staff JWT.
 * Uses the edge-safe auth config — no MongoDB or bcrypt imports here.
 */
export default edgeAuth((req) => {
  const { nextUrl } = req;
  const session = req.auth;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isLoginPage = nextUrl.pathname === "/admin/login";
  const isAdminApi = nextUrl.pathname.startsWith("/api/admin");

  if (!isAdminRoute && !isAdminApi) return NextResponse.next();

  if (isLoginPage) {
    if (session?.user) {
      return NextResponse.redirect(new URL("/admin", nextUrl));
    }
    return NextResponse.next();
  }

  if (!session?.user) {
    if (isAdminApi) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", nextUrl);
    loginUrl.searchParams.set("from", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session.user.role !== "admin" && session.user.role !== "staff") {
    if (isAdminApi) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    return new NextResponse("Forbidden", { status: 403 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
