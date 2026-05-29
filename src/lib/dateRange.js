/**
 * Date-range presets and helpers used by the admin dashboard.
 *
 * URL contract:
 *   - ?range=today | yesterday | 7d | 30d | 90d | 12m | mtd | qtd | ytd | custom
 *   - When range=custom, also accept ?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * Default when no params are present: "7d" (last 7 days inclusive of today).
 */

const MS_DAY = 24 * 60 * 60 * 1000;

export function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function sameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isoDate(d) {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseIsoDate(s) {
  if (!s) return null;
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) {
    const fallback = new Date(s);
    return isNaN(fallback.getTime()) ? null : fallback;
  }
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d.getTime()) ? null : d;
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function startOfQuarter(d) {
  const q = Math.floor(d.getMonth() / 3) * 3;
  return new Date(d.getFullYear(), q, 1, 0, 0, 0, 0);
}

function startOfYear(d) {
  return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);
}

/**
 * Preset definitions. The `group` field controls how they're laid out in
 * the picker side rail.
 */
export const PRESETS = [
  { id: "today", label: "Today", group: "Day" },
  { id: "yesterday", label: "Yesterday", group: "Day" },
  { id: "7d", label: "Last 7 days", group: "Last" },
  { id: "30d", label: "Last 30 days", group: "Last" },
  { id: "90d", label: "Last 90 days", group: "Last" },
  { id: "12m", label: "Last 12 months", group: "Last" },
  { id: "mtd", label: "Month to date", group: "Period to date" },
  { id: "qtd", label: "Quarter to date", group: "Period to date" },
  { id: "ytd", label: "Year to date", group: "Period to date" },
];

export const PRESET_GROUPS = ["Day", "Last", "Period to date"];

export function rangeFromPreset(presetId, now = new Date()) {
  const today = startOfDay(now);
  const todayEnd = endOfDay(now);

  switch (presetId) {
    case "today":
      return { from: today, to: todayEnd };
    case "yesterday": {
      const y = new Date(today.getTime() - MS_DAY);
      return { from: y, to: endOfDay(y) };
    }
    case "7d":
      return {
        from: new Date(today.getTime() - 6 * MS_DAY),
        to: todayEnd,
      };
    case "30d":
      return {
        from: new Date(today.getTime() - 29 * MS_DAY),
        to: todayEnd,
      };
    case "90d":
      return {
        from: new Date(today.getTime() - 89 * MS_DAY),
        to: todayEnd,
      };
    case "12m": {
      const from = new Date(today);
      from.setFullYear(from.getFullYear() - 1);
      from.setDate(from.getDate() + 1); // exclusive boundary
      return { from, to: todayEnd };
    }
    case "mtd":
      return { from: startOfMonth(now), to: todayEnd };
    case "qtd":
      return { from: startOfQuarter(now), to: todayEnd };
    case "ytd":
      return { from: startOfYear(now), to: todayEnd };
    default:
      return null;
  }
}

/**
 * Parse range from Next.js searchParams (object-shaped).
 * Returns `{ from, to, presetId }` with sensible defaults.
 */
export function parseRangeFromParams(params, now = new Date()) {
  const range = (params?.range || "7d").toString();

  if (range === "custom") {
    const f = parseIsoDate(params?.from);
    const t = parseIsoDate(params?.to);
    if (f && t) {
      const from = startOfDay(f);
      const to = endOfDay(t);
      if (from <= to) {
        return { from, to, presetId: "custom" };
      }
    }
    // bad params — fall through to default
  }

  const r = rangeFromPreset(range, now);
  if (r) return { ...r, presetId: range };

  // ultimate fallback
  const fallback = rangeFromPreset("7d", now);
  return { ...fallback, presetId: "7d" };
}

/**
 * Returns the equal-length window immediately preceding the given range.
 * The previous-period `to` is exactly 1ms before the current `from`, so the
 * two periods don't overlap.
 */
export function previousPeriodOf({ from, to }) {
  const span = to.getTime() - from.getTime();
  return {
    from: new Date(from.getTime() - span - 1),
    to: new Date(from.getTime() - 1),
  };
}

/**
 * Human label for the trigger button.
 *  - Preset: returns the preset's label ("Last 7 days")
 *  - Custom same-day: returns the single date ("May 29, 2026")
 *  - Custom multi-day: returns "May 22 – May 28, 2026"
 */
export function formatRangeLabel({ from, to, presetId }) {
  if (presetId && presetId !== "custom") {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (preset) return preset.label;
  }
  return formatRangeDates(from, to);
}

export function formatRangeDates(from, to) {
  const fmt = (d) =>
    d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  if (sameDay(from, to)) return fmt(from);
  // If same year, drop the year from the from-date
  if (from.getFullYear() === to.getFullYear()) {
    const fmtShort = (d) =>
      d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    return `${fmtShort(from)} – ${fmt(to)}`;
  }
  return `${fmt(from)} – ${fmt(to)}`;
}

/**
 * "vs previous N days" caption used on stat tile changes.
 */
export function describePreviousPeriod({ from, to }) {
  const days = Math.max(1, Math.round((to - from) / MS_DAY));
  if (days === 1) return "vs previous day";
  if (days === 7) return "vs previous 7 days";
  if (days === 30) return "vs previous 30 days";
  if (days === 90) return "vs previous 90 days";
  return `vs previous ${days} days`;
}
