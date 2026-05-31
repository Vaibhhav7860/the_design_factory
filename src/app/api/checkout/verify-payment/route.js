import { NextResponse } from "next/server";
import { z } from "zod";
import {
  verifyRazorpaySignature,
  markOrderPaid,
  markOrderFailed,
} from "@/lib/services/checkout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  razorpay_order_id: z.string().trim().min(1).max(120),
  razorpay_payment_id: z.string().trim().min(1).max(120),
  razorpay_signature: z.string().trim().min(1).max(256),
});

/**
 * POST /api/checkout/verify-payment
 *
 * Browser hands us the three values Razorpay returned to its `handler`
 * callback. We verify the HMAC signature, then mark the order paid.
 *
 * This route is the user-facing redirect path. The webhook is the
 * secondary, defence-in-depth path — see /api/razorpay/webhook.
 */
export async function POST(request) {
  let body;
  try {
    body = BodySchema.parse(await request.json());
  } catch (err) {
    if (err?.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", issues: err.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!verifyRazorpaySignature(body)) {
    // Signature mismatch is a hard failure — log it so we can audit and
    // mark the order failed so the admin sees the attempt.
    console.warn("[checkout/verify-payment] signature mismatch", {
      razorpay_order_id: body.razorpay_order_id,
    });
    try {
      await markOrderFailed({
        razorpayOrderId: body.razorpay_order_id,
        reason: "Signature verification failed",
      });
    } catch {}
    return NextResponse.json(
      { success: false, error: "Payment verification failed" },
      { status: 400 }
    );
  }

  try {
    const { order, alreadyPaid } = await markOrderPaid({
      razorpayOrderId: body.razorpay_order_id,
      razorpayPaymentId: body.razorpay_payment_id,
    });
    return NextResponse.json({
      success: true,
      orderId: String(order._id),
      orderNumber: order.orderNumber,
      total: order.total / 100,
      currency: order.currency,
      alreadyPaid,
    });
  } catch (err) {
    if (err?.code === "NOT_FOUND") {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }
    console.error("[checkout/verify-payment]", err);
    return NextResponse.json(
      { error: "Could not finalise the payment. We'll reconcile shortly." },
      { status: 500 }
    );
  }
}
