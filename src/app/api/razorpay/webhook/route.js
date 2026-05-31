import crypto from "node:crypto";
import { NextResponse } from "next/server";
import {
  markOrderPaid,
  markOrderFailed,
} from "@/lib/services/checkout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/razorpay/webhook
 *
 * Defence-in-depth. Razorpay calls us with payment events even if the
 * user closed their browser before our /verify-payment call landed.
 * We trust ONLY events whose body matches the X-Razorpay-Signature
 * header HMAC.
 *
 * Webhook URL to configure in the Razorpay dashboard:
 *   https://<your-domain>/api/razorpay/webhook
 *
 * Events to subscribe to:
 *   payment.captured  → mark order paid
 *   payment.failed    → mark order failed
 */
export async function POST(request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    // We accept the request to avoid Razorpay retry storms, but log it
    // so the operator notices the misconfiguration.
    console.warn(
      "[razorpay/webhook] RAZORPAY_WEBHOOK_SECRET not set — events ignored"
    );
    return NextResponse.json({ ok: true });
  }

  // Read the raw body — signature is HMAC of the exact payload bytes.
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";

  const expected = crypto
    .createHmac("sha256", secret)
    .update(raw)
    .digest("hex");

  let valid = false;
  try {
    valid = crypto.timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(signature, "utf8")
    );
  } catch {
    valid = false;
  }

  if (!valid) {
    console.warn("[razorpay/webhook] signature mismatch");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = payload.event;
  const payment = payload.payload?.payment?.entity;
  const orderId = payment?.order_id;

  if (!orderId) {
    return NextResponse.json({ ok: true });
  }

  try {
    if (event === "payment.captured") {
      await markOrderPaid({
        razorpayOrderId: orderId,
        razorpayPaymentId: payment.id,
      });
    } else if (event === "payment.failed") {
      await markOrderFailed({
        razorpayOrderId: orderId,
        reason:
          payment?.error_description || payment?.error_reason || "Payment failed",
      });
    }
  } catch (err) {
    console.error("[razorpay/webhook] handler error", err);
    // Returning 200 anyway — Razorpay will retry and we don't want to
    // cause a retry storm if a transient DB error happened. The
    // markOrderPaid path is idempotent.
  }

  return NextResponse.json({ ok: true });
}
