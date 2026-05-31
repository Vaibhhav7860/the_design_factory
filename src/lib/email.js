/**
 * Tiny transactional-email helper.
 *
 * Uses Resend (https://resend.com) when RESEND_API_KEY is present.
 * Otherwise falls back to console logging — useful in dev so the link
 * still gets printed in your terminal.
 *
 * The only consumer right now is the password-reset flow. Order
 * confirmations don't go through email (the customer lands on the
 * editorial /checkout/success page and that's that).
 */

export async function sendEmail({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  const rawFrom = process.env.RESEND_FROM || "onboarding@resend.dev";
  const from = sanitiseFromAddress(rawFrom);

  if (!apiKey) {
    console.log("\n──────── EMAIL (no RESEND_API_KEY, dev fallback) ────────");
    console.log("To     :", to);
    console.log("From   :", from);
    console.log("Subject:", subject);
    console.log(text || html.replace(/<[^>]+>/g, ""));
    console.log("──────────────────────────────────────────────────────────\n");
    return { sent: false, dryRun: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });

  if (!res.ok) {
    let body = null;
    try {
      body = await res.json();
    } catch {}
    const err = new Error(
      `Email send failed: HTTP ${res.status} ${
        body?.message || body?.error || ""
      }`
    );
    err.status = res.status;
    err.detail = body;
    throw err;
  }

  const data = await res.json();
  return { sent: true, id: data?.id };
}

/**
 * Build a "Reset your password" email body. Plain HTML in the editorial
 * cream + ink palette. Includes a fallback URL line for clients that
 * strip the button.
 */
export function buildPasswordResetEmail({ name, resetUrl }) {
  const greeting = name ? `Hi ${name},` : "Hi there,";
  const subject = "Reset your password — The Design Factory";

  const html = `
  <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background:#FBF8F3; padding:32px;">
    <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:12px; padding:32px; border:1px solid rgba(26,16,8,0.08);">
      <h1 style="font-family: 'Cormorant Garamond', Georgia, serif; font-weight:600; color:#1A1A1A; font-size:26px; margin:0 0 16px;">Reset your password</h1>
      <p style="color:#3a2800; line-height:1.6; font-size:14px; margin:0 0 14px;">${greeting}</p>
      <p style="color:#3a2800; line-height:1.6; font-size:14px; margin:0 0 22px;">
        We got a request to reset your password. Click the button below to choose a new one. The link is valid for the next 60 minutes.
      </p>
      <p style="margin:24px 0;">
        <a href="${resetUrl}" style="display:inline-block; padding:14px 26px; background:#1A1A1A; color:#fff; text-decoration:none; border-radius:8px; font-weight:600; letter-spacing:0.4px;">Reset password</a>
      </p>
      <p style="color:#6b6b6b; font-size:12px; line-height:1.6; margin:0 0 12px;">
        If the button doesn't work, copy this link into your browser:
      </p>
      <p style="color:#6b6b6b; font-size:11px; word-break:break-all; margin:0 0 22px;">${resetUrl}</p>
      <p style="color:#9a9a9a; font-size:12px; line-height:1.6; margin:0;">
        Didn't request this? You can safely ignore this email — your password won't change.
      </p>
      <hr style="border:none; border-top:1px solid rgba(26,16,8,0.08); margin:24px 0;" />
      <p style="color:#9a9a9a; font-size:11px; letter-spacing:1.2px; text-transform:uppercase; margin:0;">The Design Factory · Handcrafted with love</p>
    </div>
  </div>`;

  const text = `${greeting}

We got a request to reset your password. Open this link in your browser to choose a new one (valid for 60 minutes):

${resetUrl}

If you didn't request a reset, ignore this email — your password won't change.

— Team, The Design Factory`;

  return { subject, html, text };
}

/**
 * Some editors auto-link email addresses inside `RESEND_FROM` so the
 * .env value ends up like:
 *   RESEND_FROM="The Design Factory <[name@domain](mailto:name@domain)>"
 * Resend then HTTP-422s us with "invalid from field". This helper
 * pulls a clean address out of those forms and falls back to the
 * Resend default sender when nothing valid is found.
 */
function sanitiseFromAddress(raw) {
  if (!raw) return "onboarding@resend.dev";
  const trimmed = String(raw).trim().replace(/^"|"$/g, "");
  const linkified = trimmed.replace(
    /\[([^\]]+)\]\(mailto:[^)]+\)/g,
    "$1"
  );
  const match = linkified.match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/);
  if (!match) return "onboarding@resend.dev";
  const email = match[0];
  const beforeAngle = linkified.indexOf("<");
  const display =
    beforeAngle > 0
      ? linkified.slice(0, beforeAngle).trim().replace(/[<>]+$/, "")
      : "";
  return display ? `${display} <${email}>` : email;
}
