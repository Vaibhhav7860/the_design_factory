import { NextResponse } from "next/server";
import { signUpCustomer } from "@/lib/services/customer-auth";

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
    const result = await signUpCustomer(body);
    return NextResponse.json({ success: true, user: result });
  } catch (err) {
    if (err?.name === "ZodError") {
      // Flatten the first issue per field for the client form.
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
    if (err?.code === "EMAIL_TAKEN") {
      return NextResponse.json(
        {
          error: err.message,
          fieldErrors: { email: err.message },
        },
        { status: 409 }
      );
    }
    console.error("[auth/sign-up]", err);
    return NextResponse.json(
      { error: "Could not create account. Please try again." },
      { status: 500 }
    );
  }
}
