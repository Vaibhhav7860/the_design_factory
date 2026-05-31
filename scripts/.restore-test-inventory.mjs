/**
 * One-shot script: revert the inventory decrements caused by a real
 * test-mode payment that ran *before* we patched markOrderPaid() to
 * skip side-effects on test orders.
 *
 * Filters by both razorpayMode === "test" AND createdAt today, to
 * make sure we don't touch the seed-data orders.
 */
import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const { connectToDatabase, mongoose } = await import(
  "../src/lib/db/mongoose.js"
);
const { Order } = await import("../src/lib/db/models/Order.js");
const { Product } = await import("../src/lib/db/models/Product.js");

await connectToDatabase();

// Today's UTC midnight. Anything created today via the live checkout
// flow is in scope; anything older is seed data and was never actually
// decremented.
const start = new Date();
start.setUTCHours(0, 0, 0, 0);

const orders = await Order.find({
  razorpayMode: "test",
  paymentStatus: "paid",
  createdAt: { $gte: start },
}).lean();

console.log(`Found ${orders.length} test-mode paid order(s) created today.`);

let reverted = 0;
for (const o of orders) {
  console.log(`  ${o.orderNumber}:`);
  for (const li of o.lineItems) {
    if (!li.productId || !li.variantId) continue;
    const before = await Product.findOne(
      { _id: li.productId, "variants._id": li.variantId },
      { "variants.$": 1 }
    ).lean();
    const beforeInv = before?.variants?.[0]?.inventory ?? null;
    await Product.updateOne(
      { _id: li.productId, "variants._id": li.variantId },
      { $inc: { "variants.$.inventory": li.quantity } }
    );
    const after = await Product.findOne(
      { _id: li.productId, "variants._id": li.variantId },
      { "variants.$": 1 }
    ).lean();
    const afterInv = after?.variants?.[0]?.inventory ?? null;
    console.log(
      `    ${li.productSlug} +${li.quantity}  (${beforeInv} → ${afterInv})`
    );
    reverted++;
  }
}

console.log(`\nReverted ${reverted} line item(s).`);
await mongoose.disconnect();
