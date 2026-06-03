import { notFound } from "next/navigation";
import mongoose from "mongoose";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import { Card } from "@/components/admin/Card";
import { Button } from "@/components/admin/Button";
import { StatusPill } from "@/components/admin/DataTable";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Order, Product } from "@/lib/db/models";
import { formatINR, formatDateTime } from "@/lib/format";
import {
  HiOutlineArrowLeft,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineCreditCard,
  HiOutlineSparkles,
} from "react-icons/hi";
import { RiWhatsappLine } from "react-icons/ri";
import styles from "./orderDetail.module.css";

export const dynamic = "force-dynamic";

export const metadata = { title: "Order · Admin" };

function isObjectId(id) {
  return typeof id === "string" && mongoose.isValidObjectId(id);
}

async function fetchOrder(id) {
  if (!isObjectId(id)) return null;
  await connectToDatabase();
  const order = await Order.findById(id).lean();
  if (!order) return null;

  // Pull cover images for each line item so the operator can spot-check
  // the order at a glance.
  const productIds = (order.lineItems || [])
    .map((li) => li.productId)
    .filter(Boolean);
  let imagesByProductId = new Map();
  if (productIds.length) {
    const products = await Product.find({ _id: { $in: productIds } })
      .select("images slug")
      .lean();
    imagesByProductId = new Map(
      products.map((p) => [String(p._id), p.images?.[0] || null])
    );
  }
  return { order, imagesByProductId };
}

export default async function AdminOrderDetailPage({ params }) {
  const { id } = await params;
  const result = await fetchOrder(id);
  if (!result) notFound();
  const { order, imagesByProductId } = result;

  const subtotal = order.subtotal ?? 0;
  const shipping = order.shipping ?? 0;
  const tax = order.tax ?? 0;
  const discount = order.discount ?? 0;
  const total = order.total ?? 0;

  return (
    <div>
      <PageHeader
        eyebrow="Order management"
        title={order.orderNumber}
        description={`Placed ${formatDateTime(order.createdAt)} · ${
          order.razorpayMode === "live" ? "Live mode" : "Test mode"
        }`}
        actions={
          <Button
            variant="ghost"
            href="/admin/orders"
            iconLeft={<HiOutlineArrowLeft />}
          >
            Back to orders
          </Button>
        }
      />

      {/* ── Status row ── */}
      <Card padded={false}>
        <div className={styles.statusRow}>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Payment</span>
            <StatusPill
              tone={
                order.paymentStatus === "paid"
                  ? "positive"
                  : order.paymentStatus === "failed"
                  ? "danger"
                  : "warning"
              }
            >
              {order.paymentStatus}
            </StatusPill>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Fulfilment</span>
            <StatusPill
              tone={
                order.fulfilmentStatus === "fulfilled"
                  ? "positive"
                  : order.fulfilmentStatus === "cancelled"
                  ? "danger"
                  : "neutral"
              }
            >
              {order.fulfilmentStatus}
            </StatusPill>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Total</span>
            <span className={styles.statusValue}>{formatINR(total)}</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Items</span>
            <span className={styles.statusValue}>
              {(order.lineItems || []).reduce(
                (sum, li) => sum + (li.quantity || 0),
                0
              )}
            </span>
          </div>
        </div>
      </Card>

      <div className={styles.layout}>
        {/* ── Left column: line items + addresses ── */}
        <div className={styles.colMain}>
          {/* Line items */}
          <Card padded={false}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Items in this order</h3>
            </div>
            <ul className={styles.itemList}>
              {(order.lineItems || []).map((li, idx) => {
                const cover = imagesByProductId.get(String(li.productId)) || null;
                const lineTotal =
                  (li.price + (li.personalisationFee || 0)) * li.quantity;
                const personalisation = li.personalisation || {};
                const hasPersonalisation =
                  personalisation && (personalisation.name || personalisation.school);
                return (
                  <li key={li._id ? String(li._id) : idx} className={styles.item}>
                    <div className={styles.itemTop}>
                      <div className={styles.itemImage}>
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cover} alt="" />
                        ) : (
                          <div className={styles.itemImageFallback} />
                        )}
                      </div>
                      <div className={styles.itemBody}>
                        <Link
                          href={
                            li.productSlug
                              ? `/admin/products/${li.productId}`
                              : "#"
                          }
                          className={styles.itemTitle}
                        >
                          {li.productTitle || li.productSlug || "Untitled"}
                        </Link>
                        <div className={styles.itemMeta}>
                          <span>SKU {li.sku || "—"}</span>
                          <span aria-hidden>·</span>
                          <span>Qty {li.quantity}</span>
                          <span aria-hidden>·</span>
                          <span>
                            Unit {formatINR(li.price)}
                            {li.personalisationFee
                              ? ` + ${formatINR(li.personalisationFee)} pers.`
                              : ""}
                          </span>
                        </div>
                      </div>
                      <div className={styles.itemTotal}>
                        {formatINR(lineTotal)}
                      </div>
                    </div>

                    {hasPersonalisation ? (
                      <div className={styles.personalisationBox}>
                        <div className={styles.personalisationHeader}>
                          <HiOutlineSparkles />
                          <span>Personalisation</span>
                        </div>
                        <dl className={styles.personalisationList}>
                          {personalisation.name ? (
                            <>
                              <dt>Name</dt>
                              <dd>
                                <strong>{personalisation.name}</strong>
                              </dd>
                            </>
                          ) : null}
                          {personalisation.font ? (
                            <>
                              <dt>Font</dt>
                              <dd>{personalisation.font}</dd>
                            </>
                          ) : null}
                          {personalisation.school ? (
                            <>
                              <dt>School</dt>
                              <dd>{personalisation.school}</dd>
                            </>
                          ) : null}
                        </dl>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </Card>

          {/* Totals */}
          <Card>
            <h3 className={styles.sectionTitle}>Order totals</h3>
            <dl className={styles.totals}>
              <div className={styles.totalRow}>
                <dt>Subtotal</dt>
                <dd>{formatINR(subtotal)}</dd>
              </div>
              {discount > 0 ? (
                <div className={styles.totalRow}>
                  <dt>
                    Discount
                    {order.discountCode ? ` · ${order.discountCode}` : ""}
                  </dt>
                  <dd>−{formatINR(discount)}</dd>
                </div>
              ) : null}
              <div className={styles.totalRow}>
                <dt>Shipping</dt>
                <dd>{formatINR(shipping)}</dd>
              </div>
              <div className={styles.totalRow}>
                <dt>Tax (incl.)</dt>
                <dd>{formatINR(tax)}</dd>
              </div>
              <div className={`${styles.totalRow} ${styles.totalGrand}`}>
                <dt>Total paid</dt>
                <dd>{formatINR(total)}</dd>
              </div>
            </dl>
          </Card>
        </div>

        {/* ── Right column: customer + addresses + payment ── */}
        <div className={styles.colSide}>
          <Card>
            <h3 className={styles.sectionTitle}>Customer</h3>
            <p className={styles.sideName}>
              {order.customerName || "Guest customer"}
            </p>
            {order.customerEmail ? (
              <a
                href={`mailto:${order.customerEmail}`}
                className={styles.sideRow}
              >
                <HiOutlineMail />
                <span>{order.customerEmail}</span>
              </a>
            ) : null}
            {order.customerPhone ? (
              <div className={styles.phoneGroup}>
                <a
                  href={`tel:${order.customerPhone}`}
                  className={styles.sideRow}
                  style={{ flexGrow: 1 }}
                >
                  <HiOutlinePhone />
                  <span>{order.customerPhone}</span>
                </a>
                <a
                  href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.waButtonOuter}
                  aria-label="Message on WhatsApp"
                >
                  <div className={styles.waButtonInner}>
                    <RiWhatsappLine />
                  </div>
                </a>
              </div>
            ) : null}
          </Card>

          {order.shippingAddress ? (
            <Card>
              <h3 className={styles.sectionTitle}>
                <HiOutlineLocationMarker className={styles.sectionIcon} />
                Shipping address
              </h3>
              <AddressBlock address={order.shippingAddress} />
            </Card>
          ) : null}

          {order.billingAddress &&
          JSON.stringify(order.billingAddress) !==
            JSON.stringify(order.shippingAddress) ? (
            <Card>
              <h3 className={styles.sectionTitle}>Billing address</h3>
              <AddressBlock address={order.billingAddress} />
            </Card>
          ) : null}

          <Card>
            <h3 className={styles.sectionTitle}>
              <HiOutlineCreditCard className={styles.sectionIcon} />
              Payment
            </h3>
            <dl className={styles.payment}>
              <dt>Mode</dt>
              <dd>{order.razorpayMode || "—"}</dd>
              <dt>Razorpay order</dt>
              <dd className={styles.mono}>
                {order.razorpayOrderId || "—"}
              </dd>
              <dt>Razorpay payment</dt>
              <dd className={styles.mono}>
                {order.razorpayPaymentId || "—"}
              </dd>
              {order.discountCode ? (
                <>
                  <dt>Discount code</dt>
                  <dd>{order.discountCode}</dd>
                </>
              ) : null}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AddressBlock({ address }) {
  return (
    <div className={styles.address}>
      {address.name ? <p>{address.name}</p> : null}
      {address.line1 ? <p>{address.line1}</p> : null}
      {address.line2 ? <p>{address.line2}</p> : null}
      <p>
        {[address.city, address.state, address.postalCode]
          .filter(Boolean)
          .join(", ")}
      </p>
      {address.country ? <p>{address.country}</p> : null}
      {address.phone ? <p className={styles.subtle}>{address.phone}</p> : null}
    </div>
  );
}
