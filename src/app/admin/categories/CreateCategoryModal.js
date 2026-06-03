"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { HiOutlineX } from "react-icons/hi";
import { createNewCategory } from "./actions";
import styles from "./categories.module.css";

export default function CreateCategoryModal({ onClose }) {
  const [categoryName, setCategoryName] = useState("");
  const [tagline, setTagline] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim() || !imagePreview) return;
    
    setIsSubmitting(true);
    
    const formData = new FormData(formRef.current);
    const res = await createNewCategory(formData);
    
    setIsSubmitting(false);
    if (res.success) {
      onClose();
    } else {
      alert("Failed to create category: " + res.error);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Create Category</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <HiOutlineX />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label>Category Name *</label>
            <input 
              type="text" 
              name="categoryName"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className={styles.input}
              placeholder="e.g. Personalized Mugs"
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label>Tagline</label>
            <input 
              type="text" 
              name="tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className={styles.input}
              placeholder="e.g. Sip your morning coffee in style"
            />
            <p className={styles.helpText}>This will be displayed on the Explore Collection page.</p>
          </div>

          <div className={styles.formGroup}>
            <label>Cover Image *</label>
            <div className={styles.imageUploadArea}>
              {imagePreview && (
                <div className={styles.imagePreview}>
                  <Image src={imagePreview} alt="Preview" width={80} height={80} style={{ objectFit: "cover", borderRadius: "8px" }} />
                </div>
              )}
              <input 
                type="file" 
                name="image" 
                accept="image/*"
                onChange={handleImageChange}
                className={styles.fileInput}
                required={!imagePreview}
              />
            </div>
          </div>

          <div className={styles.modalActions}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!categoryName.trim() || !imagePreview || isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
