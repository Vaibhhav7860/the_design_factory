"use client";

import { useState, useTransition, useMemo } from "react";
import DataTable, { StatusPill } from "@/components/admin/DataTable";
import { formatINR, formatDateTime } from "@/lib/format";
import { bulkUpdateOrders } from "./actions";
import { useRouter } from "next/navigation";
import styles from "./OrderListClient.module.css";
import { HiOutlineCheck, HiOutlineX, HiOutlineTrash } from "react-icons/hi";

export default function OrderListClient({ orders }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isPending, startTransition] = useTransition();

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(orders.map((o) => o.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (e, id) => {
    e.stopPropagation(); // prevent clicking the row link
    const newSet = new Set(selectedIds);
    if (e.target.checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const executeBulkAction = (actionType) => {
    if (selectedIds.size === 0) return;
    
    // Confirmation for cancel/delete
    if (actionType === "delete" && !window.confirm(`Are you sure you want to delete ${selectedIds.size} orders?`)) {
      return;
    }
    if (actionType === "cancel" && !window.confirm(`Are you sure you want to cancel ${selectedIds.size} orders?`)) {
      return;
    }

    startTransition(async () => {
      const res = await bulkUpdateOrders(Array.from(selectedIds), actionType);
      if (res.success) {
        setSelectedIds(new Set());
      } else {
        alert("Action failed: " + res.error);
      }
    });
  };

  const allSelected = orders.length > 0 && selectedIds.size === orders.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < orders.length;

  const columns = useMemo(() => [
    {
      key: "selection",
      header: (
        <input
          type="checkbox"
          checked={allSelected}
          onChange={handleSelectAll}
          ref={(input) => {
            if (input) input.indeterminate = isIndeterminate;
          }}
          className={styles.checkbox}
        />
      ),
      render: (o) => (
        <input
          type="checkbox"
          checked={selectedIds.has(o.id)}
          onChange={(e) => handleSelectRow(e, o.id)}
          onClick={(e) => e.stopPropagation()}
          className={styles.checkbox}
        />
      ),
    },
    { key: "orderNumber", header: "Order", render: (o) => <span style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12 }}>{o.orderNumber}</span> },
    { key: "createdAt", header: "Date", render: (o) => formatDateTime(o.createdAt) },
    { key: "customerName", header: "Customer", render: (o) => o.customerName || "Guest" },
    { key: "total", header: "Total", align: "right", render: (o) => formatINR(o.total ?? 0) },
    { key: "paymentStatus", header: "Payment", render: (o) => <StatusPill tone={o.paymentStatus === "paid" ? "positive" : "warning"}>{o.paymentStatus}</StatusPill> },
    { key: "fulfilmentStatus", header: "Fulfilment", render: (o) => <StatusPill tone={o.fulfilmentStatus === "fulfilled" ? "positive" : "neutral"}>{o.fulfilmentStatus}</StatusPill> },
  ], [orders, selectedIds, allSelected, isIndeterminate]);

  return (
    <>
      <DataTable
        columns={columns}
        rows={orders}
        rowHref={(row) => `/admin/orders/${row.id}`}
      />
      
      {selectedIds.size > 0 && (
        <div className={styles.actionBar}>
          <div className={styles.actionBarInner}>
            <div className={styles.selectionCount}>
              {selectedIds.size} order{selectedIds.size > 1 ? "s" : ""} selected
            </div>
            <div className={styles.actionButtons}>
              <button 
                onClick={() => executeBulkAction("fulfil")} 
                disabled={isPending}
                className={styles.primaryBtn}
              >
                <HiOutlineCheck /> {isPending ? "Updating..." : "Mark as fulfilled"}
              </button>
              

              <button 
                onClick={() => executeBulkAction("delete")} 
                disabled={isPending}
                className={styles.dangerBtn}
              >
                <HiOutlineTrash /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
