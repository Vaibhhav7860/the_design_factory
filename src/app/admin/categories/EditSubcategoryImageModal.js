"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { HiOutlineX } from "react-icons/hi";
import { updateSubcategoryImages } from "./actions";
import styles from "./categories.module.css";

export default function EditSubcategoryImageModal({ category, subcategory, onClose }) {
  const [imgPreview, setImgPreview] = useState(null);
  const [circlePreview, setCirclePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pick = (setter) => (e) => {
    const file = e.target.files?.[0];
    setter(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(formRef.current);
    formData.append("categoryId", category._id);
    formData.append("subcategorySlug", subcategory.slug);

    const res = await updateSubcategoryImages(formData);
    setSubmitting(false);

    if (res.success) onClose();
    else alert("Failed to update images: " + res.error);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Update Sub-category Images</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <HiOutlineX />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label>Sub-category</label>
            <input
              type="text"
              value={`${category.title} · ${subcategory.title}`}
              disabled
              className={styles.input}
            />
            <p className={styles.helpText}>
              Leave a field empty to keep the current image. At least one is required.
            </p>
          </div>

          <div className={styles.formGroup}>
            <label>Cover Image</label>
            <p className={styles.helpText}>
              The rectangular showcase card on the category page.
            </p>
            <div className={styles.imageUploadArea}>
              {(imgPreview || subcategory.image) && (
                <div className={styles.imagePreview}>
                  <Image
                    src={imgPreview || subcategory.image}
                    alt="Cover preview"
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
                onChange={pick(setImgPreview)}
                className={styles.fileInput}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Circle Image</label>
            <p className={styles.helpText}>
              The round icon in the filter slider at the top of the category page.
            </p>
            <div className={styles.imageUploadArea}>
              {(circlePreview || subcategory.circleImage) && (
                <div className={styles.imagePreview}>
                  <Image
                    src={circlePreview || subcategory.circleImage}
                    alt="Circle preview"
                    width={80}
                    height={80}
                    style={{ objectFit: "cover", borderRadius: "50%" }}
                  />
                </div>
              )}
              <input
                type="file"
                name="circleImage"
                accept="image/*"
                onChange={pick(setCirclePreview)}
                className={styles.fileInput}
              />
            </div>
          </div>

          <div className={styles.modalActions}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save Images"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
