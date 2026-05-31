import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.join(process.cwd(), ".env.local") });
const { connectToDatabase, mongoose } = await import("../src/lib/db/mongoose.js");
const { Order } = await import("../src/lib/db/models/Order.js");
await connectToDatabase();
const all = await Order.find({}).sort({ createdAt: -1 }).limit(10).lean();
console.log("recent orders:");
for (const o of all) {
  console.log("  ", o.orderNumber, "status=" + o.paymentStatus, "mode=" + o.razorpayMode, "total=₹" + (o.total / 100));
  for (const li of o.lineItems) {
    console.log("     ", li.productSlug, "×" + li.quantity, "pid=" + li.productId, "vid=" + li.variantId);
  }
}
await mongoose.disconnect();
