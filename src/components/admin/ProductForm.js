"use client";

import { useState, useMemo, useRef, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineCloudUpload,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlinePlus,
  HiOutlineCheck,
  HiOutlineExclamationCircle,
  HiOutlineArrowsExpand,
} from "react-icons/hi";
import { Button } from "./Button";
import { Card, CardHeader } from "./Card";
import styles from "./ProductForm.module.css";
import { subcategoriesForCategories } from "@/lib/data/categories-taxonomy";

const MAX_IMAGES = 10;
const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "image/gif",
];

/**
 * Image entry shape:
 *   { id, kind: "existing", url }            // already in DB
 *   { id, kind: "new", file, previewUrl }    // freshly added in this session
 */
function rupeesFromPaise(paise) {
  if (paise == null) return "";
  return (Math.round(paise) / 100).toString();
}

function makeInitialImages(initial) {
  if (!initial?.images?.length) return [];
  return initial.images.map((url) => ({
    id: `existing-${url}`,
    kind: "existing",
    url,
  }));
}

export default function ProductForm({
  mode = "create",
  initial = null,
  categories,
  tagColors,
}) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [isPending, startTransition] = useTransition();

  // ── State seeded from `initial` for edit mode ──
  const [images, setImages] = useState(() => makeInitialImages(initial));
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [originalPrice, setOriginalPrice] = useState(
    rupeesFromPaise(initial?.originalPrice)
  );
  const [price, setPrice] = useState(rupeesFromPaise(initial?.price));
  const [discountPercent, setDiscountPercent] = useState(
    initial?.discountPercent != null ? String(initial.discountPercent) : ""
  );
  const [pricingFocus, setPricingFocus] = useState(null);

  const initialVariant = initial?.variants?.[0] || {};
  const [sku, setSku] = useState(initialVariant.sku || "");
  const [inventory, setInventory] = useState(
    initialVariant.inventory != null ? String(initialVariant.inventory) : "0"
  );
  const [lowStockThreshold, setLowStockThreshold] = useState(
    initialVariant.lowStockThreshold != null
      ? String(initialVariant.lowStockThreshold)
      : "5"
  );
  const [trackInventory, setTrackInventory] = useState(true);

  const [selectedCategories, setSelectedCategories] = useState(
    initial?.categories || []
  );
  const [selectedSubcategories, setSelectedSubcategories] = useState(
    initial?.subcategories || []
  );
  const [tags, setTags] = useState(initial?.tags || []);
  const [tagDraft, setTagDraft] = useState({
    label: "",
    color: tagColors[0].value,
  });
  const [status, setStatus] = useState(initial?.status || "active");

  const [serverError, setServerError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

  // Live derive subcategories from selected categories
  const availableSubcats = useMemo(
    () => subcategoriesForCategories(selectedCategories),
    [selectedCategories]
  );

  // Drop subcategories that no longer belong to any selected category
  useEffect(() => {
    setSelectedSubcategories((prev) =>
      prev.filter((s) => availableSubcats.some((sc) => sc.slug === s))
    );
  }, [availableSubcats]);

  // ── Pricing linkage ──
  useEffect(() => {
    const op = parseFloat(originalPrice);
    const p = parseFloat(price);
    const d = parseFloat(discountPercent);

    if (pricingFocus === "discountPercent") {
      if (Number.isFinite(op) && Number.isFinite(d) && d >= 0 && d <= 100) {
        const next = (op * (1 - d / 100)).toFixed(2);
        if (next !== price) setPrice(next);
      }
      return;
    }

    if (Number.isFinite(op) && Number.isFinite(p) && op > 0) {
      const computed = ((op - p) / op) * 100;
      const rounded = Math.max(0, Math.min(100, computed)).toFixed(1);
      if (rounded !== discountPercent) setDiscountPercent(rounded);
    } else if (!originalPrice && !price) {
      if (discountPercent !== "") setDiscountPercent("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalPrice, price, discountPercent, pricingFocus]);

  // ── Image handling ──
  const handleFiles = (files) => {
    const list = Array.from(files);
    setServerError(null);

    const accepted = [];
    for (const f of list) {
      if (!ALLOWED_MIME.includes(f.type)) {
        setServerError(`Unsupported file type: ${f.name}`);
        continue;
      }
      if (f.size > MAX_BYTES) {
        setServerError(`${f.name} exceeds the 25 MB limit`);
        continue;
      }
      accepted.push(f);
    }

    setImages((prev) => {
      const remainingSlots = MAX_IMAGES - prev.length;
      const toAdd = accepted.slice(0, remainingSlots).map((file) => ({
        id: `new-${crypto.randomUUID()}`,
        kind: "new",
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      if (accepted.length > remainingSlots) {
        setServerError(`Only ${MAX_IMAGES} images per product. Extras ignored.`);
      }
      return [...prev, ...toAdd];
    });
  };

  const removeImage = (id) => {
    setImages((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target?.kind === "new" && target.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  // ── Reorder images by dragging ──
  const dragIndex = useRef(null);
  const handleDragStart = (idx) => (dragIndex.current = idx);
  const handleDragOver = (e) => e.preventDefault();
  const handleDropReorder = (overIdx) => {
    if (dragIndex.current === null || dragIndex.current === overIdx) return;
    setImages((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(dragIndex.current, 1);
      copy.splice(overIdx, 0, moved);
      return copy;
    });
    dragIndex.current = null;
  };

  // ── Categories ──
  const toggleCategory = (slug) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };
  const toggleSubcategory = (slug) => {
    setSelectedSubcategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  // ── Tags ──
  const addTag = () => {
    const label = tagDraft.label.trim();
    if (!label) return;
    if (tags.length >= 8) {
      setServerError("Maximum 8 tags per product.");
      return;
    }
    setTags((prev) => [...prev, { label, color: tagDraft.color }]);
    setTagDraft({ label: "", color: tagColors[0].value });
  };
  const removeTag = (idx) => {
    setTags((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Submit ──
  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});
    setSuccess(null);

    // Client-side validation
    const errors = {};
    if (!title.trim()) errors.title = "Title is required";
    if (!selectedCategories.length) errors.categories = "Pick at least one category";
    if (!images.length) errors.images = "Upload at least one image";

    const op = parseFloat(originalPrice);
    const p = parseFloat(price);
    if (!Number.isFinite(op) || op < 0) errors.originalPrice = "Mark price is required";
    if (!Number.isFinite(p) || p < 0) errors.price = "Discounted price is required";
    if (Number.isFinite(op) && Number.isFinite(p) && p > op) {
      errors.price = "Discounted price cannot exceed mark price";
    }

    const inv = parseInt(inventory, 10);
    const lst = parseInt(lowStockThreshold, 10);
    if (trackInventory) {
      if (!Number.isFinite(inv) || inv < 0) errors.inventory = "Quantity must be a non-negative number";
      if (!Number.isFinite(lst) || lst < 0) errors.lowStockThreshold = "Threshold must be a non-negative number";
    }

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    // Build the payload. Most of it is shared between create + edit.
    const basePayload = {
      title: title.trim(),
      description: description.trim(),
      categories: selectedCategories,
      subcategories: selectedSubcategories,
      originalPrice: Math.round(op * 100), // → paise
      price: Math.round(p * 100),
      tags,
      status,
      sku: sku.trim() || undefined,
      inventory: trackInventory ? inv : 0,
      lowStockThreshold: trackInventory ? lst : 0,
    };

    const formData = new FormData();
    const newFiles = images.filter((i) => i.kind === "new");

    if (isEdit) {
      // For edit, we send `imagesOrder` so the server can reconstruct the
      // exact final order by interleaving kept URLs with newly-uploaded ones.
      const imagesOrder = images.map((i) =>
        i.kind === "existing" ? i.url : "__NEW__"
      );
      formData.set(
        "payload",
        JSON.stringify({ ...basePayload, imagesOrder })
      );
      for (const img of newFiles) {
        formData.append("images", img.file, img.file.name);
      }
    } else {
      formData.set("payload", JSON.stringify(basePayload));
      for (const img of newFiles) {
        formData.append("images", img.file, img.file.name);
      }
    }

    startTransition(async () => {
      try {
        const url = isEdit
          ? `/api/admin/products/${initial.id}`
          : "/api/admin/products";
        const res = await fetch(url, {
          method: isEdit ? "PUT" : "POST",
          body: formData,
        });
        const data = await res.json();

        if (!res.ok) {
          if (data?.issues) {
            const next = {};
            for (const issue of data.issues) {
              const k = issue.path?.[0] || "_form";
              next[k] = issue.message;
            }
            setFieldErrors(next);
          }
          setServerError(data?.error || `Save failed (${res.status})`);
          return;
        }

        setSuccess({
          id: data.product.id,
          slug: data.product.slug,
          title: data.product.title,
        });

        // Brief celebratory state, then redirect to listing
        setTimeout(() => {
          if (isEdit) {
            // Refresh the list page so the updated row shows immediately
            router.push("/admin/products");
            router.refresh();
          } else {
            router.push("/admin/products");
          }
        }, 700);
      } catch (err) {
        setServerError(err.message || "Network error");
      }
    });
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.kind === "new" && img.previewUrl) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.grid}>
        {/* ── LEFT COLUMN ── */}
        <div className={styles.colMain}>
          {/* Images */}
          <Card>
            <CardHeader
              title="Product images"
              subtitle={`Up to ${MAX_IMAGES}. JPG, PNG, WebP, AVIF, GIF or SVG. ≤ 25 MB each. Drag to reorder.`}
            />

            <div
              className={`${styles.dropZone} ${images.length ? styles.dropZoneSlim : ""}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
            >
              <HiOutlineCloudUpload className={styles.dropIcon} aria-hidden="true" />
              <div className={styles.dropText}>
                <strong>Drag images here</strong>
                <span>or click to browse</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_MIME.join(",")}
                multiple
                hidden
                onChange={(e) => {
                  if (e.target.files?.length) handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            {fieldErrors.images ? (
              <FieldError>{fieldErrors.images}</FieldError>
            ) : null}

            {images.length > 0 ? (
              <div className={styles.thumbs}>
                {images.map((img, idx) => {
                  const src = img.kind === "existing" ? img.url : img.previewUrl;
                  return (
                    <div
                      key={img.id}
                      className={`${styles.thumb} ${idx === 0 ? styles.thumbPrimary : ""}`}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDropReorder(idx)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" />
                      {idx === 0 ? <span className={styles.thumbBadge}>Cover</span> : null}
                      <button
                        type="button"
                        className={styles.thumbRemove}
                        onClick={() => removeImage(img.id)}
                        aria-label="Remove image"
                      >
                        <HiOutlineTrash />
                      </button>
                      <span className={styles.thumbDrag} aria-hidden="true">
                        <HiOutlineArrowsExpand />
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </Card>

          {/* Title + Description */}
          <Card>
            <CardHeader title="Basic details" />
            <Field
              label="Product title"
              required
              error={fieldErrors.title}
              hint="Shown on product cards and the product detail page."
            >
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Personalised Art Bag — Mermaid"
                maxLength={200}
                className={styles.input}
              />
            </Field>

            {isEdit ? (
              <Field
                label="Slug"
                hint="Locked once a product is live to keep storefront URLs stable."
              >
                <input
                  type="text"
                  value={initial.slug}
                  disabled
                  className={styles.input}
                />
              </Field>
            ) : null}

            <Field
              label="Description"
              hint="Markdown / rich text accepted. Shown in the Story section on the storefront."
            >
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell the story of this product…"
                rows={6}
                maxLength={50000}
                className={styles.textarea}
              />
              <span className={styles.counter}>
                {description.length.toLocaleString()} / 50,000
              </span>
            </Field>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader
              title="Pricing"
              subtitle="Set the mark price and the discounted price; the percentage updates automatically."
            />
            <div className={styles.priceGrid}>
              <Field
                label="Mark price (₹)"
                required
                error={fieldErrors.originalPrice}
              >
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={1}
                  value={originalPrice}
                  onFocus={() => setPricingFocus("originalPrice")}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="1500"
                  className={styles.input}
                />
              </Field>

              <Field label="Discount %" hint="Auto-calculated; you can override.">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={100}
                  step={0.1}
                  value={discountPercent}
                  onFocus={() => setPricingFocus("discountPercent")}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="20"
                  className={styles.input}
                />
              </Field>

              <Field
                label="Discounted price (₹)"
                required
                error={fieldErrors.price}
                hint="What the customer actually pays."
              >
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={1}
                  value={price}
                  onFocus={() => setPricingFocus("price")}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1200"
                  className={styles.input}
                />
              </Field>
            </div>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader
              title="Inventory"
              subtitle="Track stock so we can warn you when it runs low and prevent overselling."
              actions={
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={trackInventory}
                    onChange={(e) => setTrackInventory(e.target.checked)}
                  />
                  <span>Track inventory</span>
                </label>
              }
            />

            <div className={styles.priceGrid}>
              <Field
                label="SKU"
                hint="Auto-generated from the slug if left blank."
                error={fieldErrors.sku}
              >
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="ART-BAG-MERMAID-DEFAULT"
                  maxLength={60}
                  className={styles.input}
                />
              </Field>

              <Field
                label="Quantity in stock"
                error={fieldErrors.inventory}
                hint={trackInventory ? "0–999,999 units." : "Disabled while tracking is off."}
              >
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={999999}
                  step={1}
                  value={inventory}
                  onChange={(e) => setInventory(e.target.value)}
                  placeholder="50"
                  className={styles.input}
                  disabled={!trackInventory}
                />
              </Field>

              <Field
                label="Low-stock alert at"
                error={fieldErrors.lowStockThreshold}
                hint="You'll get a notification when stock drops to this level."
              >
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={999999}
                  step={1}
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  placeholder="5"
                  className={styles.input}
                  disabled={!trackInventory}
                />
              </Field>
            </div>
          </Card>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className={styles.colAside}>
          {/* Status */}
          <Card>
            <CardHeader title="Status" />
            <div className={styles.statusGroup}>
              {[
                { value: "active", label: "Active", description: "Visible on the storefront" },
                { value: "draft", label: "Draft", description: "Hidden until published" },
                ...(isEdit ? [{ value: "archived", label: "Archived", description: "Hidden everywhere" }] : []),
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`${styles.statusOption} ${status === opt.value ? styles.statusOptionActive : ""}`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={opt.value}
                    checked={status === opt.value}
                    onChange={() => setStatus(opt.value)}
                  />
                  <div>
                    <strong>{opt.label}</strong>
                    <span>{opt.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader
              title="Categories"
              subtitle="A product can belong to more than one category."
            />
            {fieldErrors.categories ? (
              <FieldError>{fieldErrors.categories}</FieldError>
            ) : null}
            <div className={styles.checkList}>
              {categories.map((cat) => (
                <label
                  key={cat.slug}
                  className={`${styles.checkItem} ${
                    selectedCategories.includes(cat.slug) ? styles.checkItemActive : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.slug)}
                    onChange={() => toggleCategory(cat.slug)}
                  />
                  <span>{cat.label}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* Subcategories */}
          <Card>
            <CardHeader
              title="Subcategories"
              subtitle={
                selectedCategories.length === 0
                  ? "Pick at least one category first."
                  : "Optional. A product can sit in multiple subcategories."
              }
            />
            {availableSubcats.length === 0 ? (
              <p className={styles.muted}>—</p>
            ) : (
              <div className={styles.checkList}>
                {availableSubcats.map((sc) => (
                  <label
                    key={sc.slug}
                    className={`${styles.checkItem} ${
                      selectedSubcategories.includes(sc.slug) ? styles.checkItemActive : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSubcategories.includes(sc.slug)}
                      onChange={() => toggleSubcategory(sc.slug)}
                    />
                    <span>{sc.label}</span>
                  </label>
                ))}
              </div>
            )}
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader
              title="Tags"
              subtitle="Up to 8. Pick a colour for each tag."
            />
            {tags.length > 0 ? (
              <div className={styles.tagList}>
                {tags.map((t, idx) => (
                  <span
                    key={idx}
                    className={styles.tag}
                    style={{ backgroundColor: t.color }}
                  >
                    {t.label}
                    <button
                      type="button"
                      onClick={() => removeTag(idx)}
                      aria-label={`Remove ${t.label}`}
                    >
                      <HiOutlineX />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            <div className={styles.tagDraft}>
              <input
                type="text"
                value={tagDraft.label}
                onChange={(e) => setTagDraft((d) => ({ ...d, label: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Tag label, e.g. Best Seller"
                maxLength={40}
                className={styles.input}
              />
              <div className={styles.swatchRow}>
                {tagColors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`${styles.swatch} ${tagDraft.color === c.value ? styles.swatchActive : ""}`}
                    style={{ backgroundColor: c.value }}
                    aria-label={`Use ${c.label}`}
                    onClick={() => setTagDraft((d) => ({ ...d, color: c.value }))}
                  >
                    {tagDraft.color === c.value ? <HiOutlineCheck /> : null}
                  </button>
                ))}
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                iconLeft={<HiOutlinePlus />}
                onClick={addTag}
                disabled={!tagDraft.label.trim()}
              >
                Add tag
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer / submit bar */}
      <div className={styles.footer}>
        <div className={styles.footerInfo}>
          {serverError ? (
            <span className={styles.errorBanner}>
              <HiOutlineExclamationCircle /> {serverError}
            </span>
          ) : success ? (
            <span className={styles.successBanner}>
              <HiOutlineCheck />{" "}
              {isEdit ? `Saved “${success.title}”.` : `Saved “${success.title}”. Redirecting…`}
            </span>
          ) : (
            <span className={styles.muted}>
              {isEdit
                ? "Changes apply immediately to the storefront after saving."
                : "Images are saved as /uploads/… for now. The Cloudflare CDN swap happens at render time and won't require resaving."}
            </span>
          )}
        </div>
        <div className={styles.footerActions}>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/admin/products")}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isPending}>
            {isPending
              ? "Saving…"
              : isEdit
              ? "Update product"
              : "Create product"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Field({ label, required, hint, error, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>
        {label}
        {required ? <span className={styles.req}> *</span> : null}
      </label>
      {children}
      {hint && !error ? <p className={styles.fieldHint}>{hint}</p> : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </div>
  );
}

function FieldError({ children }) {
  return (
    <p className={styles.fieldError}>
      <HiOutlineExclamationCircle aria-hidden="true" /> {children}
    </p>
  );
}
