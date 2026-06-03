"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Image from "next/image";
import { HiOutlineX, HiSearch, HiCheck } from "react-icons/hi";
import { createSubcategory, searchProducts } from "./actions";
import styles from "./categories.module.css";

export default function AddSubcategoryModal({ category, onClose }) {
  const [subcategoryName, setSubcategoryName] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, startSearchTransition] = useTransition();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const searchTimeout = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);

  // Focus trap and escape key
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

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    
    searchTimeout.current = setTimeout(() => {
      startSearchTransition(async () => {
        const results = await searchProducts(q);
        setSearchResults(results);
      });
    }, 300);
  };

  const toggleProduct = (product) => {
    setSelectedProducts(prev => {
      if (prev.some(p => p._id === product._id)) {
        return prev.filter(p => p._id !== product._id);
      }
      return [...prev, product];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subcategoryName.trim()) return;
    
    setIsSubmitting(true);
    
    const formData = new FormData(formRef.current);
    formData.append("categoryId", category._id);
    formData.append("selectedProductIds", JSON.stringify(selectedProducts.map(p => p._id)));
    
    const res = await createSubcategory(formData);
    
    setIsSubmitting(false);
    if (res.success) {
      onClose();
    } else {
      alert("Failed to create subcategory: " + res.error);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Add Sub-category</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <HiOutlineX />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label>Category</label>
            <input type="text" value={category.title} disabled className={styles.input} />
            <p className={styles.helpText}>Sub-category will be added under this category.</p>
          </div>

          <div className={styles.formGroup}>
            <label>Sub-category Name *</label>
            <input 
              type="text" 
              name="subcategoryName"
              value={subcategoryName}
              onChange={(e) => setSubcategoryName(e.target.value)}
              className={styles.input}
              placeholder="e.g. Mixed Shape Labels"
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label>Cover Image (Optional)</label>
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
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Add Products to Sub-category (Optional)</label>
            
            <div className={styles.searchWrapper}>
              <HiSearch className={styles.searchIcon} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search products to add..."
                className={styles.input}
                style={{ paddingLeft: "36px" }}
              />
              
              {searchQuery && searchResults.length > 0 && (
                <div className={styles.dropdownMenu}>
                  {searchResults.map(product => {
                    const isSelected = selectedProducts.some(p => p._id === product._id);
                    return (
                      <div 
                        key={product._id} 
                        className={styles.dropdownItem}
                        onClick={() => toggleProduct(product)}
                      >
                        <div className={styles.productAvatar}>
                          {product.image ? (
                            <Image src={product.image} alt={product.title} width={32} height={32} />
                          ) : (
                            <div className={styles.placeholderAvatar} />
                          )}
                        </div>
                        <span className={styles.productTitle}>{product.title}</span>
                        {isSelected && <HiCheck className={styles.checkIcon} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedProducts.length > 0 && (
              <div className={styles.selectedChips}>
                {selectedProducts.map(product => (
                  <div key={product._id} className={styles.chip}>
                    {product.title}
                    <button type="button" onClick={() => toggleProduct(product)}>
                      <HiOutlineX />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.modalActions}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!subcategoryName.trim() || isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Sub-category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
