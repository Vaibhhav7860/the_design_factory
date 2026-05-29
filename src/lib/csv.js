/**
 * Tiny CSV serialiser. Handles quoting, embedded commas/quotes/newlines,
 * date instances and array joining via semicolons (so cells stay in one
 * column when opened in Excel/Numbers/Sheets).
 *
 * The output is prefixed with a UTF-8 BOM (\uFEFF) so Excel correctly
 * detects encoding for non-ASCII text (Indian names, currency symbols, etc).
 */

const CRLF = "\r\n";

function escapeCell(value) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) {
    return escapeCell(value.map((v) => stringify(v)).join("; "));
  }
  if (typeof value === "object") {
    return escapeCell(JSON.stringify(value));
  }

  const s = String(value);
  if (s === "") return "";

  // Quote when the cell contains characters CSV reserves, and double
  // up internal quotes per RFC 4180.
  const needsQuoting = /[",\r\n]/.test(s);
  if (!needsQuoting) return s;
  return `"${s.replace(/"/g, '""')}"`;
}

function stringify(v) {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

/**
 * Build a CSV string from columns + rows.
 *
 *   columns: [{ key, header, format? }]
 *   rows:    array of plain objects
 *
 * format(value, row) lets you transform a single cell. If omitted, the
 * value at row[col.key] is used as-is.
 */
export function toCSV(columns, rows) {
  const headerLine = columns
    .map((c) => escapeCell(c.header ?? c.key))
    .join(",");

  const bodyLines = rows.map((row) =>
    columns
      .map((c) => {
        const raw = c.format ? c.format(row[c.key], row) : row[c.key];
        return escapeCell(raw);
      })
      .join(",")
  );

  return "\uFEFF" + [headerLine, ...bodyLines].join(CRLF) + CRLF;
}

/**
 * Wrap the CSV string in a Response suitable for a file download.
 */
export function csvResponse(csv, filename) {
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
