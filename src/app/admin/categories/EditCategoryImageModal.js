"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { HiOutlineX } from "react-icons/hi";
import { updateCategoryImage } from "./actions";
import styles from "./categories.module.css";

export default function EditCategoryImageModal({ category, onClose }) {
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(formRef.current);
    formData.append("categoryId", category._id);

    const res = await updateCategoryImage(formData);
    setSubmitting(false);

    if (res.success) onClose();
    else alert("Failed to update image: " + res.error);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Update Category Image</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <HiOutlineX />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label>Category</label>
            <input type="text" value={category.title} disabled className={styles.input} />
            <p className={styles.helpText}>
              Updates everywhere this category appears: the navbar mega-menu image,
              the homepage grid card, and the category page.
            </p>
          </div>

          <div className={styles.formGroup}>
            <label>New Image *</label>
            <div className={styles.imageUploadArea}>
              {(preview || category.image) && (
                <div className={styles.imagePreview}>
                  <Image
                    src={preview || category.image}
                    alt="Preview"
                    width={80}
                    height={80}
                    style={{ objectFit: "cover", borderRadius: "8px" }}
                  />
                </div>
              )}
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className={styles.fileInput}
                required
              />
            </div>
          </div>

          <div className={styles.modalActions}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save Image"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
