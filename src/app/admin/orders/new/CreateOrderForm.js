"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi";
import { formatINR } from "@/lib/format";
import { createOrder, searchProductsForOrder } from "../actions";
import styles from "./new.module.css";

const emptyLineItem = () => ({
  key: Math.random().toString(36).slice(2),
  productId: "",
  productTitle: "",
  productSlug: "",
  variantId: "",
  sku: "",
  quantity: 1,
  priceRupees: "",
  personalisationFeeRupees: "",
  personalisation: { name: "", school: "", font: "" },
  // local-only search state
  search: "",
  results: [],
  variants: [],
});

const emptyAddress = () => ({
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "IN",
});

export default function CreateOrderForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [lineItems, setLineItems] = useState([emptyLineItem()]);
  const [shippingAddress, setShippingAddress] = useState(emptyAddress());
  const [billingSame, setBillingSame] = useState(true);
  const [billingAddress, setBillingAddress] = useState(emptyAddress());

  const [details, setDetails] = useState({
    shippingMethod: "standard",
    shippingRupees: "",
    taxRupees: "",
    discountRupees: "",
    discountCode: "",
    currency: "INR",
    paymentStatus: "pending",
    fulfilmentStatus: "unfulfilled",
    tags: "",
    note: "",
  });

  const searchTimers = useRef({});

  // ── Line item helpers ──
  const updateItem = (key, patch) =>
    setLineItems((items) =>
      items.map((it) => (it.key === key ? { ...it, ...patch } : it))
    );

  const handleProductSearch = (key, q) => {
    updateItem(key, { search: q });
    if (searchTimers.current[key]) clearTimeout(searchTimers.current[key]);
    if (q.length < 2) {
      updateItem(key, { results: [] });
      return;
    }
    searchTimers.current[key] = setTimeout(async () => {
      const results = await searchProductsForOrder(q);
      updateItem(key, { results });
    }, 300);
  };

  const selectProduct = (key, product) => {
    updateItem(key, {
      productId: product._id,
      productTitle: product.title,
      productSlug: product.slug,
      priceRupees: (product.price / 100).toString(),
      variants: product.variants || [],
      variantId: "",
      sku: "",
      search: product.title,
      results: [],
    });
  };

  const selectVariant = (key, item, variantId) => {
    const v = item.variants.find((x) => x._id === variantId);
    updateItem(key, {
      variantId,
      sku: v?.sku || "",
      priceRupees: v ? (v.price / 100).toString() : item.priceRupees,
    });
  };

  const addLineItem = () => setLineItems((items) => [...items, emptyLineItem()]);
  const removeLineItem = (key) =>
    setLineItems((items) => (items.length > 1 ? items.filter((it) => it.key !== key) : items));

  // ── Live totals (paise) ──
  const subtotal = lineItems.reduce((sum, it) => {
    const price = Math.round((Number(it.priceRupees) || 0) * 100);
    const fee = Math.round((Number(it.personalisationFeeRupees) || 0) * 100);
    const qty = Math.max(1, parseInt(it.quantity, 10) || 1);
    return sum + (price + fee) * qty;
  }, 0);
  const shipping = Math.round((Number(details.shippingRupees) || 0) * 100);
  const tax = Math.round((Number(details.taxRupees) || 0) * 100);
  const discount = Math.round((Number(details.discountRupees) || 0) * 100);
  const total = Math.max(0, subtotal + shipping + tax - discount);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      lineItems: lineItems.map((it) => ({
        productId: it.productId,
        productTitle: it.productTitle,
        productSlug: it.productSlug,
        variantId: it.variantId || undefined,
        sku: it.sku,
        quantity: it.quantity,
        priceRupees: it.priceRupees,
        personalisationFeeRupees: it.personalisationFeeRupees,
        personalisation: it.personalisation,
      })),
      shippingRupees: details.shippingRupees,
      taxRupees: details.taxRupees,
      discountRupees: details.discountRupees,
      shippingMethod: details.shippingMethod,
      discountCode: details.discountCode,
      currency: details.currency,
      shippingAddress,
      billingSameAsShipping: billingSame,
      billingAddress: billingSame ? undefined : billingAddress,
      paymentStatus: details.paymentStatus,
      fulfilmentStatus: details.fulfilmentStatus,
      tags: details.tags,
      note: details.note,
    };

    startTransition(async () => {
      const res = await createOrder(payload);
      if (res.success) {
        router.push(`/admin/orders/${res.orderId}`);
      } else {
        setError(res.error || "Failed to create order");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  const addrFields = (addr, setAddr) => (
    <>
      <div className={styles.grid2}>
        <div className={styles.field}>
          <label>Full name *</label>
          <input className={styles.input} value={addr.name}
            onChange={(e) => setAddr({ ...addr, name: e.target.value })} />
        </div>
        <div className={styles.field}>
          <label>Phone *</label>
          <input className={styles.input} value={addr.phone}
            onChange={(e) => setAddr({ ...addr, phone: e.target.value })} />
        </div>
      </div>
      <div className={styles.field}>
        <label>Address line 1 *</label>
        <input className={styles.input} value={addr.line1}
          onChange={(e) => setAddr({ ...addr, line1: e.target.value })} />
      </div>
      <div className={styles.field}>
        <label>Address line 2</label>
        <input className={styles.input} value={addr.line2}
          onChange={(e) => setAddr({ ...addr, line2: e.target.value })} />
      </div>
      <div className={styles.grid3}>
        <div className={styles.field}>
          <label>City *</label>
          <input className={styles.input} value={addr.city}
            onChange={(e) => setAddr({ ...addr, city: e.target.value })} />
        </div>
        <div className={styles.field}>
          <label>State *</label>
          <input className={styles.input} value={addr.state}
            onChange={(e) => setAddr({ ...addr, state: e.target.value })} />
        </div>
        <div className={styles.field}>
          <label>Postal code *</label>
          <input className={styles.input} value={addr.postalCode}
            onChange={(e) => setAddr({ ...addr, postalCode: e.target.value })} />
        </div>
      </div>
      <div className={styles.field}>
        <label>Country</label>
        <input className={styles.input} value={addr.country}
          onChange={(e) => setAddr({ ...addr, country: e.target.value })} />
      </div>
    </>
  );

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.error}>{error}</div>}

      {/* Customer */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Customer</h3>
        <div className={styles.grid3}>
          <div className={styles.field}>
            <label>Name</label>
            <input className={styles.input} value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
          </div>
          <div className={styles.field}>
            <label>Email</label>
            <input type="email" className={styles.input} value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
          </div>
          <div className={styles.field}>
            <label>Phone</label>
            <input className={styles.input} value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
          </div>
        </div>
        <p className={styles.muted} style={{ marginTop: 8 }}>
          At least one of name, email or phone is required.
        </p>
      </div>

      {/* Line items */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Products</h3>
        {lineItems.map((it, idx) => (
          <div key={it.key} className={styles.lineItem}>
            <div className={styles.lineItemHead}>
              <span className={styles.lineItemTitle}>Item {idx + 1}</span>
              {lineItems.length > 1 && (
                <button type="button" className={styles.removeBtn}
                  onClick={() => removeLineItem(it.key)} title="Remove item">
                  <HiOutlineTrash />
                </button>
              )}
            </div>

            <div className={styles.field}>
              <label>Search product *</label>
              <div className={styles.searchWrap}>
                <input
                  className={styles.input}
                  placeholder="Type at least 2 characters…"
                  value={it.search}
                  onChange={(e) => handleProductSearch(it.key, e.target.value)}
                />
                {it.results.length > 0 && (
                  <div className={styles.dropdown}>
                    {it.results.map((p) => (
                      <div key={p._id} className={styles.dropdownItem}
                        onClick={() => selectProduct(it.key, p)}>
                        <span>{p.title}</span>
                        <span className={styles.muted}>{formatINR(p.price)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {it.productId && (
                <span className={styles.muted}>
                  Selected: {it.productTitle} ({it.productSlug})
                </span>
              )}
            </div>

            {it.variants.length > 0 && (
              <div className={styles.field}>
                <label>Variant</label>
                <select className={styles.select} value={it.variantId}
                  onChange={(e) => selectVariant(it.key, it, e.target.value)}>
                  <option value="">— none —</option>
                  {it.variants.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.sku} · {formatINR(v.price)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className={styles.grid3}>
              <div className={styles.field}>
                <label>Quantity *</label>
                <input type="number" min="1" className={styles.input} value={it.quantity}
                  onChange={(e) => updateItem(it.key, { quantity: e.target.value })} />
              </div>
              <div className={styles.field}>
                <label>Unit price (₹) *</label>
                <input type="number" min="0" step="0.01" className={styles.input} value={it.priceRupees}
                  onChange={(e) => updateItem(it.key, { priceRupees: e.target.value })} />
              </div>
              <div className={styles.field}>
                <label>Personalisation fee (₹)</label>
                <input type="number" min="0" step="0.01" className={styles.input}
                  value={it.personalisationFeeRupees}
                  onChange={(e) => updateItem(it.key, { personalisationFeeRupees: e.target.value })} />
              </div>
            </div>

            <div className={styles.grid3}>
              <div className={styles.field}>
                <label>Personalisation name</label>
                <input className={styles.input} value={it.personalisation.name}
                  onChange={(e) => updateItem(it.key, { personalisation: { ...it.personalisation, name: e.target.value } })} />
              </div>
              <div className={styles.field}>
                <label>School</label>
                <input className={styles.input} value={it.personalisation.school}
                  onChange={(e) => updateItem(it.key, { personalisation: { ...it.personalisation, school: e.target.value } })} />
              </div>
              <div className={styles.field}>
                <label>Font</label>
                <input className={styles.input} value={it.personalisation.font}
                  onChange={(e) => updateItem(it.key, { personalisation: { ...it.personalisation, font: e.target.value } })} />
              </div>
            </div>
          </div>
        ))}
        <button type="button" className={styles.addBtn} onClick={addLineItem}>
          <HiOutlinePlus /> Add another product
        </button>
      </div>

      {/* Shipping address */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Shipping address</h3>
        {addrFields(shippingAddress, setShippingAddress)}
      </div>

      {/* Billing address */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Billing address</h3>
        <label className={styles.checkboxRow} style={{ marginBottom: 12 }}>
          <input type="checkbox" checked={billingSame}
            onChange={(e) => setBillingSame(e.target.checked)} />
          Same as shipping address
        </label>
        {!billingSame && addrFields(billingAddress, setBillingAddress)}
      </div>

      {/* Order details */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Order details</h3>
        <div className={styles.grid3}>
          <div className={styles.field}>
            <label>Shipping method</label>
            <select className={styles.select} value={details.shippingMethod}
              onChange={(e) => setDetails({ ...details, shippingMethod: e.target.value })}>
              <option value="standard">Standard</option>
              <option value="express">Express</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Shipping cost (₹)</label>
            <input type="number" min="0" step="0.01" className={styles.input} value={details.shippingRupees}
              onChange={(e) => setDetails({ ...details, shippingRupees: e.target.value })} />
          </div>
          <div className={styles.field}>
            <label>Tax (₹)</label>
            <input type="number" min="0" step="0.01" className={styles.input} value={details.taxRupees}
              onChange={(e) => setDetails({ ...details, taxRupees: e.target.value })} />
          </div>
        </div>
        <div className={styles.grid3} style={{ marginTop: 16 }}>
          <div className={styles.field}>
            <label>Discount (₹)</label>
            <input type="number" min="0" step="0.01" className={styles.input} value={details.discountRupees}
              onChange={(e) => setDetails({ ...details, discountRupees: e.target.value })} />
          </div>
          <div className={styles.field}>
            <label>Discount code</label>
            <input className={styles.input} value={details.discountCode}
              onChange={(e) => setDetails({ ...details, discountCode: e.target.value })} />
          </div>
          <div className={styles.field}>
            <label>Currency</label>
            <input className={styles.input} value={details.currency}
              onChange={(e) => setDetails({ ...details, currency: e.target.value })} />
          </div>
        </div>
        <div className={styles.grid3} style={{ marginTop: 16 }}>
          <div className={styles.field}>
            <label>Payment status</label>
            <select className={styles.select} value={details.paymentStatus}
              onChange={(e) => setDetails({ ...details, paymentStatus: e.target.value })}>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="partially_refunded">Partially refunded</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Fulfilment status</label>
            <select className={styles.select} value={details.fulfilmentStatus}
              onChange={(e) => setDetails({ ...details, fulfilmentStatus: e.target.value })}>
              <option value="unfulfilled">Unfulfilled</option>
              <option value="partial">Partial</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Tags (comma separated)</label>
            <input className={styles.input} value={details.tags}
              onChange={(e) => setDetails({ ...details, tags: e.target.value })} />
          </div>
        </div>
        <div className={styles.field} style={{ marginTop: 16 }}>
          <label>Internal note</label>
          <textarea className={styles.textarea} value={details.note}
            onChange={(e) => setDetails({ ...details, note: e.target.value })} />
        </div>
      </div>

      {/* Summary */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Summary</h3>
        <div className={styles.summary}>
          <div className={styles.summaryRow}><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
          <div className={styles.summaryRow}><span>Shipping</span><span>{formatINR(shipping)}</span></div>
          <div className={styles.summaryRow}><span>Tax</span><span>{formatINR(tax)}</span></div>
          <div className={styles.summaryRow}><span>Discount</span><span>− {formatINR(discount)}</span></div>
          <div className={styles.summaryTotal}><span>Total</span><span>{formatINR(total)}</span></div>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className="btn btn-outline"
          onClick={() => router.push("/admin/orders")} disabled={isPending}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? "Creating…" : "Create order"}
        </button>
      </div>
    </form>
  );
}
