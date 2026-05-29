import Link from "next/link";
import styles from "./DataTable.module.css";

/**
 * Lightweight responsive data-table primitive.
 * On mobile (< 768px) rows fall back to a stacked card layout via CSS.
 *
 * Optional row-link behaviour. Pass a function that returns an href and the
 * whole row becomes clickable (a real anchor underneath, so middle-click,
 * Cmd/Ctrl-click, copy-link and keyboard navigation all work):
 *
 *   <DataTable rowHref={(row) => `/admin/products/${row.id}`} ... />
 */
export default function DataTable({
  columns,
  rows,
  emptyMessage = "No records yet.",
  rowHref,
}) {
  if (!rows?.length) {
    return <div className={styles.empty}>{emptyMessage}</div>;
  }

  const isClickable = typeof rowHref === "function";

  return (
    <div className={styles.tableWrap}>
      <table className={`${styles.table} ${isClickable ? styles.tableClickable : ""}`}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={c.align ? styles[`align-${c.align}`] : ""}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const href = isClickable ? rowHref(row) : null;
            return (
              <tr
                key={row.id ?? idx}
                className={isClickable ? styles.rowClickable : undefined}
              >
                {columns.map((c, colIdx) => (
                  <td
                    key={c.key}
                    className={`${c.align ? styles[`align-${c.align}`] : ""} ${
                      isClickable && colIdx === 0 ? styles.rowAnchorCell : ""
                    }`}
                    data-label={typeof c.header === "string" ? c.header : ""}
                  >
                    {/* Hidden full-row link rendered once per row, anchored
                        from the first cell. Real interactive elements in
                        other cells stack above it via z-index. */}
                    {isClickable && colIdx === 0 && href ? (
                      <Link
                        href={href}
                        className={styles.rowAnchor}
                        aria-label={`Open ${row.title || row.name || row.orderNumber || "record"}`}
                      />
                    ) : null}
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function StatusPill({ tone = "neutral", children }) {
  return <span className={`${styles.pill} ${styles[`pill-${tone}`]}`}>{children}</span>;
}
