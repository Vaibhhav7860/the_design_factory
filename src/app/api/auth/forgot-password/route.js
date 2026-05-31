import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/services/customer-auth";

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
    await requestPasswordReset(body);
    // Always succeed publicly — never reveal whether an email is on file.
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err?.name === "ZodError") {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      );
    }
    console.error("[auth/forgot-password]", err);
    // Still return success to avoid enumeration leaks.
    return NextResponse.json({ success: true });
  }
}
