import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import {
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/lib/services/account";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (body?.action === "setDefault") {
      await setDefaultAddress(session.user.email, id);
      return NextResponse.json({ success: true });
    }
    const address = await updateAddress(session.user.email, id, body);
    return NextResponse.json({ success: true, address });
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
    if (err?.code === "NOT_FOUND") {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error("[account/addresses PUT]", err);
    return NextResponse.json({ error: "Could not update address." }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await deleteAddress(session.user.email, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err?.code === "NOT_FOUND") {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error("[account/addresses DELETE]", err);
    return NextResponse.json({ error: "Could not delete address." }, { status: 500 });
  }
}
