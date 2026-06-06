import { NextResponse } from "next/server";
import { z } from "zod";
import { createPendingOrder } from "@/lib/services/checkout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ContactSchema = z.object({
  email: z.string().email().max(120),
  phone: z.string().trim().min(7).max(20).optional().or(z.literal("")),
  whatsappUpdates: z.boolean().optional(),
  emailOffers: z.boolean().optional(),
});

const AddressSchema = z.object({
  country: z.string().trim().max(60).optional(),
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().max(60).optional().or(z.literal("")),
  address: z.string().trim().min(1).max(200),
  apartment: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(1).max(80),
  state: z.string().trim().min(1).max(80),
  pinCode: z.string().regex(/^\d{6}$/, "PIN code must be 6 digits"),
  phone: z.string().trim().min(7).max(20),
  saveInfo: z.boolean().optional(),
  textOffers: z.boolean().optional(),
});

const CartItemSchema = z.object({
  slug: z.string().trim().min(1).max(200),
  quantity: z.coerce.number().int().min(1).max(99),
  personalisation: z
    .object({
      isPersonalised: z.boolean().optional(),
      name: z.string().max(60).optional(),
      font: z.string().max(60).optional(),
      school: z.string().max(100).optional(),
    })
    .partial()
    .optional()
    .nullable(),
});

const BodySchema = z.object({
  cart: z.array(CartItemSchema).min(1),
  contact: ContactSchema,
  delivery: AddressSchema,
  billingAddressSame: z.boolean().optional(),
  billing: AddressSchema.partial().optional().nullable(),
  discountCode: z.string().trim().max(40).optional().or(z.literal("")),
  shippingMethod: z.enum(["standard", "express"]).optional(),
});

/**
 * POST /api/checkout/razorpay-order
 *
 * Server creates the Razorpay order from the verified cart and persists
 * a pending Order document. Returns the keys the browser needs to open
 * Razorpay Checkout.
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

  try {
    const result = await createPendingOrder({
      cart: body.cart,
      contact: body.contact,
      delivery: body.delivery,
      billing:
        body.billingAddressSame === false ? body.billing : body.delivery,
      discountCode: body.discountCode || undefined,
      shippingMethod: body.shippingMethod,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err?.code === "EMPTY_CART") {
      return NextResponse.json(
        { error: "Your cart is empty." },
        { status: 400 }
      );
    }
    if (err?.code === "PRODUCT_UNAVAILABLE") {
      return NextResponse.json(
        {
          error: `One of your items is no longer available: ${err.slug}. Refresh your cart.`,
          slug: err.slug,
        },
        { status: 409 }
      );
    }
    if (err?.code === "RAZORPAY_NOT_CONFIGURED") {
      return NextResponse.json(
        {
          error:
            "Online payment is temporarily unavailable. Please try again shortly.",
        },
        { status: 503 }
      );
    }
    console.error("[checkout/razorpay-order]", err);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 }
    );
  }
}
