/**
 * Order Confirmation Email — Nodemailer + Gmail SMTP
 *
 * Uses a Gmail "App Password" (not the regular login password) to send
 * transactional order-confirmation emails directly from the brand's
 * Gmail address (radhikavibgyor@gmail.com).
 *
 * Required env vars:
 *   GMAIL_USER        — the Gmail address (radhikavibgyor@gmail.com)
 *   GMAIL_APP_PASSWORD — a 16-char App Password generated at
 *                        https://myaccount.google.com/apppasswords
 *
 * How to generate an App Password:
 *   1. Enable 2-Step Verification on the Google account.
 *   2. Go to https://myaccount.google.com/apppasswords
 *   3. Create a new app password (select "Mail" → "Other" → name it).
 *   4. Copy the 16-character password into your .env.local.
 */

import nodemailer from "nodemailer";

// ─────────────────────────────────────────────────────────────────────
// Transporter singleton (reused across invocations in the same process)
// ─────────────────────────────────────────────────────────────────────

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn(
      "[email] GMAIL_USER or GMAIL_APP_PASSWORD not set — emails will be logged to console only."
    );
    return null;
  }

  _transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  return _transporter;
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

/** Format paise → ₹ string (e.g. 149900 → "₹1,499.00") */
function formatRupees(paise) {
  const rupees = (paise || 0) / 100;
  return `₹${rupees.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Capitalise "john doe" → "John Doe" */
function titleCase(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());
}

// ─────────────────────────────────────────────────────────────────────
// HTML Template
// ─────────────────────────────────────────────────────────────────────

function buildOrderConfirmationHTML(order) {
  const firstName = titleCase(
    (order.customerName || "").split(" ")[0] || "there"
  );

  const itemsHTML = order.lineItems
    .map((li) => {
      const personalisationNote =
        li.personalisation?.name
          ? `<br/><span style="color:#7a6a55;font-size:12px;">Personalised for: ${li.personalisation.name}</span>`
          : "";
      const unitPrice = formatRupees(li.price);
      const lineTotal = formatRupees((li.price + (li.personalisationFee || 0)) * li.quantity);
      return `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #f0ece4;font-size:14px;color:#1A1A1A;line-height:1.5;">
          ${li.productTitle || li.productSlug}${personalisationNote}
        </td>
        <td style="padding:14px 0;border-bottom:1px solid #f0ece4;font-size:14px;color:#6E6E6E;text-align:center;">
          ${li.quantity}
        </td>
        <td style="padding:14px 0;border-bottom:1px solid #f0ece4;font-size:14px;color:#1A1A1A;text-align:right;font-weight:500;">
          ${lineTotal}
        </td>
      </tr>`;
    })
    .join("");

  const shippingAddr = order.shippingAddress || {};
  const addressLines = [
    shippingAddr.name,
    shippingAddr.line1,
    shippingAddr.line2,
    [shippingAddr.city, shippingAddr.state, shippingAddr.postalCode]
      .filter(Boolean)
      .join(", "),
  ]
    .filter(Boolean)
    .join("<br/>");

  const discountRow =
    order.discount && order.discount > 0
      ? `<tr>
           <td colspan="2" style="padding:6px 0;font-size:14px;color:#2d8a4e;">Discount</td>
           <td style="padding:6px 0;font-size:14px;color:#2d8a4e;text-align:right;font-weight:500;">
             -${formatRupees(order.discount)}
           </td>
         </tr>`
      : "";

  const shippingRow =
    order.shipping && order.shipping > 0
      ? `<tr>
           <td colspan="2" style="padding:6px 0;font-size:14px;color:#6E6E6E;">Shipping</td>
           <td style="padding:6px 0;font-size:14px;color:#6E6E6E;text-align:right;">
             ${formatRupees(order.shipping)}
           </td>
         </tr>`
      : `<tr>
           <td colspan="2" style="padding:6px 0;font-size:14px;color:#2d8a4e;">Shipping</td>
           <td style="padding:6px 0;font-size:14px;color:#2d8a4e;text-align:right;">
             FREE
           </td>
         </tr>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Order Confirmation — The Design Factory</title>
</head>
<body style="margin:0;padding:0;background:#FBF8F3;font-family:'Helvetica Neue',Arial,sans-serif;">

  <!-- ── Wrapper ── -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#FBF8F3;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- ── Card ── -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="580"
               style="max-width:580px;background:#ffffff;border-radius:16px;border:1px solid rgba(26,16,8,0.08);overflow:hidden;">

          <!-- Brand banner -->
          <tr>
            <td style="background:linear-gradient(135deg,#1A1A1A 0%,#2d2620 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-family:'Georgia',serif;font-size:22px;font-weight:600;color:#FBF8F3;letter-spacing:1.5px;">
                THE DESIGN FACTORY
              </h1>
              <p style="margin:8px 0 0;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(251,248,243,0.6);">
                Personalised · Hand-finished · Made with love
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:36px 40px 0;">
              <h2 style="font-family:'Georgia',serif;font-size:24px;font-weight:500;color:#1A1A1A;margin:0 0 8px;line-height:1.3;">
                Thank you for shopping with us, ${firstName}! 🎉
              </h2>
              <p style="font-size:14px;line-height:1.7;color:#5a4e3c;margin:0 0 6px;">
                We're absolutely thrilled that you chose The Design Factory! Your order has been confirmed and our team is already getting to work on making something truly special — just for you.
              </p>
              <p style="font-size:14px;line-height:1.7;color:#5a4e3c;margin:0;">
                Every piece is crafted with care, personalised with love, and packed with a little extra joy. Here are the details of your order:
              </p>
            </td>
          </tr>

          <!-- Order number pill -->
          <tr>
            <td style="padding:24px 40px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:#FBF8F3;border:1px solid #e8e0d4;border-radius:24px;padding:10px 24px;">
                    <span style="font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:#7a6a55;font-weight:600;">
                      Order No.
                    </span>
                    <span style="font-size:15px;font-weight:700;color:#1A1A1A;margin-left:8px;letter-spacing:0.5px;">
                      ${order.orderNumber}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items table -->
          <tr>
            <td style="padding:28px 40px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
                     style="border-top:2px solid #1A1A1A;">
                <tr>
                  <th style="padding:12px 0;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#7a6a55;text-align:left;font-weight:600;">
                    Item
                  </th>
                  <th style="padding:12px 0;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#7a6a55;text-align:center;font-weight:600;">
                    Qty
                  </th>
                  <th style="padding:12px 0;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#7a6a55;text-align:right;font-weight:600;">
                    Amount
                  </th>
                </tr>
                ${itemsHTML}
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding:16px 40px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td colspan="2" style="padding:6px 0;font-size:14px;color:#6E6E6E;">Subtotal</td>
                  <td style="padding:6px 0;font-size:14px;color:#6E6E6E;text-align:right;">
                    ${formatRupees(order.subtotal)}
                  </td>
                </tr>
                ${discountRow}
                ${shippingRow}
                <tr>
                  <td colspan="3" style="padding:0;"><hr style="border:none;border-top:2px solid #1A1A1A;margin:12px 0 8px;" /></td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:6px 0;font-size:17px;font-weight:700;color:#1A1A1A;">
                    Total Paid
                  </td>
                  <td style="padding:6px 0;font-size:17px;font-weight:700;color:#1A1A1A;text-align:right;">
                    ${formatRupees(order.total)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping address -->
          <tr>
            <td style="padding:28px 40px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
                     style="background:#FBF8F3;border-radius:12px;padding:20px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 8px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#7a6a55;font-weight:600;">
                      Delivering To
                    </p>
                    <p style="margin:0;font-size:14px;line-height:1.7;color:#1A1A1A;">
                      ${addressLines}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Warm closing -->
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="font-size:14px;line-height:1.7;color:#5a4e3c;margin:0 0 12px;">
                We can't wait for you to receive your order! Each product is being carefully prepared and will be on its way to you very soon. We'll send you a shipping notification as soon as your package is dispatched.
              </p>
              <p style="font-size:14px;line-height:1.7;color:#5a4e3c;margin:0 0 12px;">
                If you have any questions or just want to say hello, we're always here for you — simply reply to this email. 💛
              </p>
              <p style="font-size:14px;line-height:1.7;color:#1A1A1A;margin:0;font-weight:500;">
                With love & gratitude,<br/>
                <span style="font-family:'Georgia',serif;font-style:italic;color:#7a6a55;">
                  Team The Design Factory
                </span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 40px 28px;">
              <hr style="border:none;border-top:1px solid rgba(26,16,8,0.08);margin:0 0 20px;" />
              <p style="margin:0 0 4px;text-align:center;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#9a9a9a;">
                The Design Factory · Handcrafted with care
              </p>
              <p style="margin:0;text-align:center;font-size:11px;color:#b0a89c;">
                Follow us on <a href="https://www.instagram.com/thedesignfactoryshop" style="color:#7a6a55;text-decoration:underline;">Instagram</a>
              </p>
            </td>
          </tr>

        </table>
        <!-- end card -->

      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────
// Plain-text fallback
// ─────────────────────────────────────────────────────────────────────

function buildOrderConfirmationText(order) {
  const firstName = titleCase(
    (order.customerName || "").split(" ")[0] || "there"
  );
  const items = order.lineItems
    .map(
      (li) =>
        `  • ${li.productTitle || li.productSlug} x${li.quantity} — ${formatRupees(
          (li.price + (li.personalisationFee || 0)) * li.quantity
        )}${
          li.personalisation?.name
            ? ` (Personalised for: ${li.personalisation.name})`
            : ""
        }`
    )
    .join("\n");

  const shippingAddr = order.shippingAddress || {};
  const addr = [
    shippingAddr.name,
    shippingAddr.line1,
    shippingAddr.line2,
    [shippingAddr.city, shippingAddr.state, shippingAddr.postalCode]
      .filter(Boolean)
      .join(", "),
  ]
    .filter(Boolean)
    .join("\n    ");

  return `Thank you for shopping with us, ${firstName}! 🎉

We're absolutely thrilled that you chose The Design Factory!
Your order has been confirmed and our team is already getting
to work on making something truly special — just for you.

──────────────────────────────────
ORDER NO: ${order.orderNumber}
──────────────────────────────────

Items:
${items}

Subtotal: ${formatRupees(order.subtotal)}${
    order.discount > 0 ? `\nDiscount: -${formatRupees(order.discount)}` : ""
  }
Shipping: ${order.shipping > 0 ? formatRupees(order.shipping) : "FREE"}
──────────────────────────────────
Total Paid: ${formatRupees(order.total)}

Delivering To:
    ${addr}

We can't wait for you to receive your order! Each product is
being carefully prepared and will be on its way to you very soon.

If you have any questions, simply reply to this email. 💛

With love & gratitude,
Team The Design Factory

──────────────────────────────────
The Design Factory · Handcrafted with care
`;
}

// ─────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────

/**
 * Send an order-confirmation email to the customer.
 *
 * Designed to be called from `markOrderPaid()` after the payment is
 * verified. Failures are non-fatal — the order is already paid and
 * persisted, so we log the error but never throw.
 *
 * @param {Object} order — a Mongoose Order document (or lean object).
 */
export async function sendOrderConfirmationEmail(order) {
  if (!order?.customerEmail) {
    console.warn("[email] No customer email on order", order?.orderNumber);
    return { sent: false, reason: "no_email" };
  }

  const subject = `Order Confirmed — ${order.orderNumber} 🎉`;
  const html = buildOrderConfirmationHTML(order);
  const text = buildOrderConfirmationText(order);
  const fromAddress =
    process.env.GMAIL_USER || "radhikavibgyor@gmail.com";

  const transporter = getTransporter();

  // Dev fallback: log to console if no Gmail credentials
  if (!transporter) {
    console.log(
      "\n──────── ORDER CONFIRMATION EMAIL (dev fallback) ────────"
    );
    console.log("To     :", order.customerEmail);
    console.log("Subject:", subject);
    console.log(text);
    console.log(
      "──────────────────────────────────────────────────────────\n"
    );
    return { sent: false, dryRun: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `The Design Factory <${fromAddress}>`,
      to: order.customerEmail,
      subject,
      html,
      text,
    });

    console.log(
      `[email] Order confirmation sent to ${order.customerEmail} — messageId: ${info.messageId}`
    );
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error(
      `[email] Failed to send order confirmation to ${order.customerEmail}:`,
      err
    );
    return { sent: false, error: err.message };
  }
}
