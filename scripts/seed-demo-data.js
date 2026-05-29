/**
 * Demo data seeder.
 *
 * - Imports every product from processed_products.json into the products
 *   collection (idempotent: existing slugs are updated, not duplicated).
 * - Generates ~30 fake customers with realistic names + Indian addresses.
 * - Generates ~50 paid orders distributed across the last 30 days, drawn
 *   exclusively from the imported products.
 *
 * Usage:
 *   npm run seed:demo
 *
 * The script is destructive ONLY for orders and customers (clears them on
 * each run so you start with a clean demo dataset). Products are merged.
 *
 * To skip the destructive reset of customers/orders, pass --keep:
 *   npm run seed:demo -- --keep
 */
import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

for (const file of [".env.local", ".env.development", ".env"]) {
  const full = path.join(projectRoot, file);
  if (fs.existsSync(full)) dotenv.config({ path: full, override: false });
}

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set. Add it to .env.local at the project root.");
  process.exit(1);
}

const keepExisting = process.argv.includes("--keep");

const { connectToDatabase, mongoose } = await import("../src/lib/db/mongoose.js");
const { Product } = await import("../src/lib/db/models/Product.js");
const { Customer } = await import("../src/lib/db/models/Customer.js");
const { Order } = await import("../src/lib/db/models/Order.js");

// ───────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────

const FIRST_NAMES = [
  "Aanya", "Aarav", "Aditi", "Advik", "Anika", "Arjun", "Aryan", "Avani",
  "Diya", "Ishaan", "Ishita", "Kabir", "Kavya", "Krish", "Meera", "Mira",
  "Nakul", "Neha", "Nikhil", "Pari", "Priya", "Rahul", "Reyansh", "Riya",
  "Saanvi", "Sahil", "Sanya", "Shreya", "Siddharth", "Tanvi", "Vihaan",
  "Yash", "Zara",
];
const LAST_NAMES = [
  "Agarwal", "Bhatia", "Chopra", "Desai", "Gupta", "Iyer", "Jain", "Kapoor",
  "Khanna", "Kumar", "Malhotra", "Mehta", "Mittal", "Nair", "Pandey", "Patel",
  "Rao", "Reddy", "Sethi", "Shah", "Sharma", "Singh", "Sinha", "Verma",
];
const CITIES = [
  { city: "Mumbai", state: "Maharashtra", postalCode: "400001" },
  { city: "Delhi", state: "Delhi", postalCode: "110001" },
  { city: "Bengaluru", state: "Karnataka", postalCode: "560001" },
  { city: "Chennai", state: "Tamil Nadu", postalCode: "600001" },
  { city: "Hyderabad", state: "Telangana", postalCode: "500001" },
  { city: "Pune", state: "Maharashtra", postalCode: "411001" },
  { city: "Kolkata", state: "West Bengal", postalCode: "700001" },
  { city: "Ahmedabad", state: "Gujarat", postalCode: "380001" },
  { city: "Jaipur", state: "Rajasthan", postalCode: "302001" },
  { city: "Lucknow", state: "Uttar Pradesh", postalCode: "226001" },
  { city: "Indore", state: "Madhya Pradesh", postalCode: "452001" },
  { city: "Chandigarh", state: "Chandigarh", postalCode: "160001" },
];
const STREET_PREFIXES = [
  "MG Road", "Park Street", "Linking Road", "Brigade Road", "Mall Road",
  "Marine Drive", "Connaught Place", "Gariahat", "Khan Market", "Hill Road",
];
const ROLES_FOR_LINE_ITEM = ["mom", "dad", "kid", "school", "office"];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const pickWeighted = (items, weights) => {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
};

const slugify = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function pickPhone() {
  const start = randomItem(["6", "7", "8", "9"]);
  let rest = "";
  for (let i = 0; i < 9; i++) rest += randomInt(0, 9);
  return `+91 ${start}${rest.slice(0, 4)} ${rest.slice(4)}`;
}

function pickAddress(name) {
  const place = randomItem(CITIES);
  return {
    name,
    phone: pickPhone(),
    line1: `${randomInt(1, 999)}, ${randomItem(STREET_PREFIXES)}`,
    line2: `Flat ${randomInt(101, 1804)}`,
    city: place.city,
    state: place.state,
    postalCode: place.postalCode,
    country: "IN",
  };
}

function generateOrderNumber(seq) {
  return `TDF-${String(seq).padStart(5, "0")}`;
}

// Generate a personalisation payload only for products whose subcategories
// suggest it (labels, school book labels, back-to-school sets) — same rule
// the storefront already uses.
const PERSONALISABLE_SUBCATS = new Set([
  "name-labels", "round-labels", "rectangular-labels", "mixed-shape-labels",
  "iron-on-labels", "school-book-labels", "back-to-school-label-set",
  "bag-tags",
]);
const FONT_OPTIONS = [
  "AGaramond Italic", "Bickam Script One", "Candlescript Pro",
  "Cataneo BT", "Signet Roundhand Italic", "Trajan Pro",
];
const SCHOOL_REQUIRES = new Set(["school-book-labels", "back-to-school-label-set"]);
const SCHOOLS = [
  "Delhi Public School", "Kendriya Vidyalaya", "Mount Carmel School",
  "Bombay Scottish School", "St. Xavier's", "DPS RK Puram",
];

// ───────────────────────────────────────────────
// Main
// ───────────────────────────────────────────────

async function main() {
  console.log("→ Connecting to MongoDB…");
  await connectToDatabase();
  console.log("  ✓ connected");

  // 1) Import products from processed_products.json
  console.log("\n→ Importing products from processed_products.json…");
  const productsPath = path.join(projectRoot, "processed_products.json");
  const raw = fs.readFileSync(productsPath, "utf8");
  const records = JSON.parse(raw);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const productOps = [];

  for (const r of records) {
    if (!r.slug || !r.title) {
      skipped++;
      continue;
    }
    const priceRupees = Number(r.price) || 0;
    if (!priceRupees) {
      skipped++;
      continue;
    }

    // Determine personalisation rule from subcategories
    const subs = Array.isArray(r.subcategories) ? r.subcategories : [];
    const hasPersonalisableSubcat = subs.some((s) => PERSONALISABLE_SUBCATS.has(s));
    const requiresSchool = subs.some((s) => SCHOOL_REQUIRES.has(s));

    const personalisation = hasPersonalisableSubcat
      ? {
          name: "required",
          school: requiresSchool ? "optional" : "hidden",
          fontSelector: "enabled",
          additionalFee: 50000, // ₹500
        }
      : {
          name: "optional",
          school: "hidden",
          fontSelector: "disabled",
          additionalFee: 0,
        };

    const sku = r.id ? r.id.toUpperCase() : slugify(r.title).toUpperCase();
    const inventory = randomInt(8, 80);
    const lowStockThreshold = 5;
    const variant = {
      sku: `${sku}-DEFAULT`.slice(0, 60),
      options: { Default: "Default" },
      price: priceRupees * 100, // paise
      inventory,
      weightGrams: randomInt(80, 600),
      lowStockThreshold,
      inLowStockState: inventory <= lowStockThreshold,
    };

    const externalImage = (r.images || []).some(
      (u) => typeof u === "string" && /^https?:\/\//.test(u)
    );

    productOps.push({
      updateOne: {
        filter: { slug: r.slug },
        update: {
          $set: {
            title: r.title,
            slug: r.slug,
            description: r.description || "",
            categories: Array.isArray(r.categories) && r.categories.length
              ? r.categories
              : ["uncategorized"],
            subcategories: subs,
            badge: r.badge || undefined,
            price: priceRupees * 100,
            originalPrice: priceRupees * 100, // same for now; admin can mark down later
            images: r.images || [],
            needsAssetMigration: externalImage,
            variants: [variant],
            personalisation,
            tags: [],
            status: "active",
          },
          $setOnInsert: {
            seo: {
              title: r.title.slice(0, 70),
              description: (r.description || "").slice(0, 160),
              slug: r.slug,
            },
          },
        },
        upsert: true,
      },
    });
  }

  if (productOps.length) {
    const result = await Product.bulkWrite(productOps, { ordered: false });
    inserted = result.upsertedCount || 0;
    updated = result.modifiedCount || 0;
    console.log(
      `  ✓ products: ${inserted} inserted, ${updated} updated, ${skipped} skipped`
    );
  }

  const allProducts = await Product.find({ status: "active" }).lean();
  console.log(`  → ${allProducts.length} active products in DB`);

  if (!allProducts.length) {
    console.error("No active products found after import. Aborting.");
    process.exit(1);
  }

  // 2) Optionally clear existing demo customers/orders
  if (!keepExisting) {
    console.log("\n→ Clearing existing customers and orders…");
    const [delC, delO] = await Promise.all([
      Customer.deleteMany({}),
      Order.deleteMany({}),
    ]);
    console.log(`  ✓ removed ${delC.deletedCount} customers, ${delO.deletedCount} orders`);
  }

  // 3) Create fake customers
  console.log("\n→ Creating fake customers…");
  const customerCount = 30;
  const customerDocs = [];
  for (let i = 0; i < customerCount; i++) {
    const first = randomItem(FIRST_NAMES);
    const last = randomItem(LAST_NAMES);
    const name = `${first} ${last}`;
    const email = `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`;
    const address = pickAddress(name);
    customerDocs.push({
      email,
      name,
      phone: address.phone,
      addresses: [{ ...address, label: "Home", isDefault: true }],
      acceptsMarketing: Math.random() > 0.3,
      tags: pickWeighted(
        [["new"], ["returning"], ["vip"], []],
        [4, 3, 1, 2]
      ),
    });
  }
  const insertedCustomers = await Customer.insertMany(customerDocs);
  console.log(`  ✓ created ${insertedCustomers.length} customers`);

  // 4) Generate paid orders distributed across the last 30 days
  console.log("\n→ Generating paid orders…");
  const orderCount = 50;
  const orderDocs = [];
  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < orderCount; i++) {
    const customer = randomItem(insertedCustomers);
    const orderDate = new Date(now - Math.random() * thirtyDaysMs);

    // 1–3 line items per order, drawn from real products
    const lineItemCount = pickWeighted([1, 2, 3], [5, 3, 2]);
    const lineItems = [];
    const usedProductIds = new Set();
    for (let j = 0; j < lineItemCount; j++) {
      let product;
      // avoid duplicate products in a single order
      for (let attempt = 0; attempt < 6; attempt++) {
        product = randomItem(allProducts);
        if (!usedProductIds.has(String(product._id))) break;
      }
      usedProductIds.add(String(product._id));

      const variant = product.variants?.[0];
      if (!variant) continue;

      const quantity = pickWeighted([1, 1, 1, 2, 3], [4, 4, 4, 2, 1]);

      // Personalisation payload based on the product's rule
      const rule = product.personalisation || {};
      let personalisation = undefined;
      let personalisationFee = 0;
      if (rule.name && rule.name !== "hidden") {
        personalisation = {
          name: `${randomItem(FIRST_NAMES)}`,
          font: randomItem(FONT_OPTIONS),
        };
        if (rule.school === "optional" || rule.school === "required") {
          personalisation.school = randomItem(SCHOOLS);
        }
        personalisationFee = rule.additionalFee || 0;
      }

      lineItems.push({
        productId: product._id,
        productSlug: product.slug,
        productTitle: product.title,
        variantId: variant._id,
        sku: variant.sku,
        quantity,
        fulfilledQuantity: 0,
        price: variant.price, // paise per unit
        personalisationFee,
        personalisation,
      });
    }

    if (!lineItems.length) continue;

    const subtotal = lineItems.reduce(
      (sum, li) => sum + li.price * li.quantity + li.personalisationFee * li.quantity,
      0
    );
    const shipping = subtotal >= 100000 ? 0 : 8000; // free over ₹1000, else ₹80
    const tax = Math.round(subtotal * 0.05); // 5% GST proxy
    const discount = 0;
    const total = subtotal + shipping + tax - discount;

    const shippingAddress = customer.addresses?.[0] || pickAddress(customer.name);

    // 70% paid + unfulfilled, 20% paid + fulfilled, 10% partial
    const lifecycle = pickWeighted(
      ["unfulfilled", "fulfilled", "partial"],
      [7, 2, 1]
    );

    let fulfilmentStatus = "unfulfilled";
    if (lifecycle === "fulfilled") {
      fulfilmentStatus = "fulfilled";
      lineItems.forEach((li) => (li.fulfilledQuantity = li.quantity));
    } else if (lifecycle === "partial") {
      fulfilmentStatus = "partial";
      lineItems.forEach(
        (li) => (li.fulfilledQuantity = Math.floor(li.quantity / 2))
      );
    }

    orderDocs.push({
      orderNumber: generateOrderNumber(i + 1),
      customerId: customer._id,
      customerEmail: customer.email,
      customerName: customer.name,
      customerPhone: customer.phone,
      lineItems,
      subtotal,
      shipping,
      tax,
      discount,
      total,
      currency: "INR",
      shippingAddress,
      billingAddress: shippingAddress,
      paymentStatus: "paid",
      fulfilmentStatus,
      razorpayOrderId: `order_demo_${i}`,
      razorpayPaymentId: `pay_demo_${i}`,
      razorpayMode: "test",
      tags: [],
      notes: [],
      createdAt: orderDate,
      updatedAt: orderDate,
    });
  }

  const insertedOrders = await Order.insertMany(orderDocs, { rawResult: false });
  console.log(`  ✓ created ${insertedOrders.length} paid orders`);

  // 5) Update customer aggregates from the orders we just inserted
  console.log("\n→ Updating customer aggregates…");
  const aggregates = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: "$customerId",
        totalSpent: { $sum: "$total" },
        totalOrders: { $sum: 1 },
        lastOrderAt: { $max: "$createdAt" },
      },
    },
  ]);
  for (const a of aggregates) {
    await Customer.updateOne(
      { _id: a._id },
      {
        $set: {
          totalSpent: a.totalSpent,
          totalOrders: a.totalOrders,
          lastOrderAt: a.lastOrderAt,
        },
      }
    );
  }
  console.log(`  ✓ updated ${aggregates.length} customer aggregates`);

  console.log("\n✅ Demo data seed complete.\n");
  console.log("Open the admin dashboard at http://localhost:3000/admin");
  console.log("Sign in with the credentials you created via `npm run seed:admin`.\n");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
