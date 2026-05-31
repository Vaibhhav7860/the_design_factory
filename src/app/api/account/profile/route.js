import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { updateProfile } from "@/lib/services/account";

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
    const data = await updateProfile(session.user.email, body);
    return NextResponse.json({ success: true, profile: data });
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
    console.error("[account/profile]", err);
    return NextResponse.json({ error: "Could not save profile." }, { status: 500 });
  }
}
