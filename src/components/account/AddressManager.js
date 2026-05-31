"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/(storefront)/account/dashboard.module.css";

const EMPTY = {
  label: "",
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "IN",
  isDefault: false,
};

export default function AddressManager({ initialAddresses, profile }) {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initialAddresses || []);
  const [editing, setEditing] = useState(null); // null | "new" | <id>
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const startNew = () => {
    setForm({
      ...EMPTY,
      name:
        [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || "",
      phone: profile?.phone || "",
      isDefault: addresses.length === 0,
    });
    setErrors({});
    setFormError(null);
    setEditing("new");
  };

  const startEdit = (addr) => {
    setForm({
      label: addr.label || "",
      name: addr.name || "",
      phone: addr.phone || "",
      line1: addr.line1 || "",
      line2: addr.line2 || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.postalCode || "",
      country: addr.country || "IN",
      isDefault: !!addr.isDefault,
    });
    setErrors({});
    setFormError(null);
    setEditing(addr.id);
  };

  const cancel = () => {
    setEditing(null);
    setErrors({});
    setFormError(null);
  };

  const onChange = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const refreshFromServer = () => {
    // Re-fetch the server component so any new defaults flow through.
    router.refresh();
  };

  const saveAddress = (e) => {
    e.preventDefault();
    setErrors({});
    setFormError(null);

    startTransition(async () => {
      try {
        const isNew = editing === "new";
        const url = isNew
          ? "/api/account/addresses"
          : `/api/account/addresses/${editing}`;
        const res = await fetch(url, {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) {
          if (data?.fieldErrors) setErrors(data.fieldErrors);
          setFormError(data?.error || "Could not save address.");
          return;
        }
        setEditing(null);
        refreshFromServer();
      } catch (err) {
        setFormError(err?.message || "Could not save address.");
      }
    });
  };

  const removeAddress = (id) => {
    if (!confirm("Delete this address? This cannot be undone.")) return;
    startTransition(async () => {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || "Could not delete address.");
        return;
      }
      setAddresses((list) => list.filter((a) => a.id !== id));
      refreshFromServer();
    });
  };

  const setDefault = (id) => {
    startTransition(async () => {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setDefault" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || "Could not set default address.");
        return;
      }
      setAddresses((list) =>
        list.map((a) => ({ ...a, isDefault: a.id === id }))
      );
      refreshFromServer();
    });
  };

  if (editing) {
    return (
      <form onSubmit={saveAddress} noValidate>
        {formError ? <div className={styles.formError}>{formError}</div> : null}

        <div className={styles.formGrid}>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={styles.label} htmlFor="label">
              Label (optional)
            </label>
            <input
              id="label"
              type="text"
              value={form.label}
              onChange={onChange("label")}
              className={styles.input}
              placeholder="Home / Office / Mom's place"
              maxLength={40}
            />
          </div>

          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={styles.label} htmlFor="name">
              Recipient name
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={onChange("name")}
              className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
              autoComplete="name"
            />
            {errors.name ? (
              <p className={styles.fieldError}>{errors.name}</p>
            ) : null}
          </div>

          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={styles.label} htmlFor="phone">
              Mobile number
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={onChange("phone")}
              className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
              autoComplete="tel"
              placeholder="+91 98765 43210"
            />
            {errors.phone ? (
              <p className={styles.fieldError}>{errors.phone}</p>
            ) : null}
          </div>

          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={styles.label} htmlFor="line1">
              Address line 1
            </label>
            <input
              id="line1"
              type="text"
              value={form.line1}
              onChange={onChange("line1")}
              className={`${styles.input} ${errors.line1 ? styles.inputError : ""}`}
              autoComplete="address-line1"
            />
            {errors.line1 ? (
              <p className={styles.fieldError}>{errors.line1}</p>
            ) : null}
          </div>

          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={styles.label} htmlFor="line2">
              Apartment, suite, etc. (optional)
            </label>
            <input
              id="line2"
              type="text"
              value={form.line2}
              onChange={onChange("line2")}
              className={styles.input}
              autoComplete="address-line2"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="city">
              City
            </label>
            <input
              id="city"
              type="text"
              value={form.city}
              onChange={onChange("city")}
              className={`${styles.input} ${errors.city ? styles.inputError : ""}`}
              autoComplete="address-level2"
            />
            {errors.city ? (
              <p className={styles.fieldError}>{errors.city}</p>
            ) : null}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="state">
              State
            </label>
            <input
              id="state"
              type="text"
              value={form.state}
              onChange={onChange("state")}
              className={`${styles.input} ${errors.state ? styles.inputError : ""}`}
              autoComplete="address-level1"
            />
            {errors.state ? (
              <p className={styles.fieldError}>{errors.state}</p>
            ) : null}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="postalCode">
              PIN code
            </label>
            <input
              id="postalCode"
              type="text"
              inputMode="numeric"
              value={form.postalCode}
              onChange={onChange("postalCode")}
              className={`${styles.input} ${errors.postalCode ? styles.inputError : ""}`}
              maxLength={6}
              autoComplete="postal-code"
            />
            {errors.postalCode ? (
              <p className={styles.fieldError}>{errors.postalCode}</p>
            ) : null}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="country">
              Country
            </label>
            <input
              id="country"
              type="text"
              value={form.country}
              onChange={onChange("country")}
              className={styles.input}
              maxLength={60}
              autoComplete="country-name"
            />
          </div>

          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                color: "#3a2800",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={!!form.isDefault}
                onChange={onChange("isDefault")}
                style={{ width: 16, height: 16, accentColor: "#b89968" }}
              />
              <span>Make this my default shipping address</span>
            </label>
          </div>
        </div>

        <div className={styles.actionsRow}>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={cancel}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={isPending}
          >
            {isPending
              ? "Saving…"
              : editing === "new"
              ? "Save address"
              : "Update address"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <>
      {addresses.length === 0 ? (
        <div className={styles.emptyOrders}>
          <strong>No saved addresses</strong>
          Save an address to make checkout faster next time.
        </div>
      ) : (
        <div className={styles.addressGrid}>
          {addresses.map((a) => (
            <div key={a.id} className={styles.addressCard}>
              {a.isDefault ? (
                <span className={styles.addressDefault}>Default</span>
              ) : null}
              <p className={styles.addressLabel}>{a.label || "Address"}</p>
              <p className={styles.addressName}>{a.name}</p>
              <p className={styles.addressLines}>
                {[a.line1, a.line2].filter(Boolean).join(", ")}
                <br />
                {[a.city, a.state, a.postalCode].filter(Boolean).join(", ")}
                <br />
                {a.country || "IN"}
              </p>
              <p className={styles.addressLines} style={{ marginTop: 6 }}>
                <span className={styles.subtle}>{a.phone}</span>
              </p>

              <div className={styles.addressActions}>
                <button
                  type="button"
                  className={styles.addressLinkBtn}
                  onClick={() => startEdit(a)}
                >
                  Edit
                </button>
                {!a.isDefault ? (
                  <button
                    type="button"
                    className={styles.addressLinkBtn}
                    onClick={() => setDefault(a.id)}
                  >
                    Set default
                  </button>
                ) : null}
                <button
                  type="button"
                  className={`${styles.addressLinkBtn} ${styles.addressLinkBtnDanger}`}
                  onClick={() => removeAddress(a.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.actionsRow}>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={startNew}
        >
          Add new address
        </button>
      </div>
    </>
  );
}
