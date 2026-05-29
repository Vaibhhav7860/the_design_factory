/**
 * Money values throughout the admin and storefront are stored as integer paise.
 * formatINR converts paise → ₹ string with proper grouping.
 */
export function formatINR(paise = 0, { showFraction = false } = {}) {
  const rupees = Math.round(paise) / 100;
  return rupees.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: showFraction ? 2 : 0,
    maximumFractionDigits: showFraction ? 2 : 0,
  });
}

export function paiseFromRupees(rupees) {
  const n = Number(rupees);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

export function formatDate(d) {
  if (!d) return "—";
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(d) {
  if (!d) return "—";
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
