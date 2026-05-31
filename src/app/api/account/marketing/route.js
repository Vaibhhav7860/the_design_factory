import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { setMarketingPreference } from "@/lib/services/account";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const result = await setMarketingPreference(
    session.user.email,
    Boolean(body?.acceptsMarketing)
  );
  return NextResponse.json(result);
}
