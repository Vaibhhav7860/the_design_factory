import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { changePassword } from "@/lib/services/account";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  try {
    const result = await changePassword(session.user.email, body);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    if (err?.name === "ZodError") {
      const fieldErrors = {};
      for (const issue of err.issues) {
        const k = issue.path?.[0] || "_form";
        if (!fieldErrors[k]) fieldErrors[k] = issue.message;
      }
      return NextResponse.json(
        { error: "Validation failed", fieldErrors },
        { status: 400 }
      );
    }
    if (err?.code === "BAD_CURRENT_PASSWORD") {
      return NextResponse.json(
        { error: err.message, fieldErrors: { currentPassword: err.message } },
        { status: 400 }
      );
    }
    console.error("[account/password]", err);
    return NextResponse.json({ error: "Could not change password." }, { status: 500 });
  }
}
