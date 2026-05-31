import { NextResponse } from "next/server";
import { resetPassword } from "@/lib/services/customer-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  try {
    const result = await resetPassword(body);
    return NextResponse.json({ success: true, email: result.email });
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
    if (err?.code === "TOKEN_INVALID") {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[auth/reset-password]", err);
    return NextResponse.json(
      { error: "Could not reset password. Please try again." },
      { status: 500 }
    );
  }
}
