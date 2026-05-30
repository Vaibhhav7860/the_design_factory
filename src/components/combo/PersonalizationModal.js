"use client";
import { useState } from "react";
import styles from "./PersonalizationModal.module.css";

export default function PersonalizationModal({ 
  isOpen,
  onClose,
  onConfirm,
  selectedProducts,
  discount,
  totalPrice,
  finalPrice
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation function
  const validateName = (value) => {
    if (value.length < 2) {
      return "Name must be at least 2 characters";
    }
    if (value.length > 20) {
      return "Name must be less than 20 characters";
    }
    if (!/^[a-zA-Z\s-]+$/.test(value)) {
      return "Name can only contain letters, spaces, and hyphens";
    }
    return "";
  };

  // Handle input change
  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    const validationError = validateName(value);
    setError(validationError);
  };

  // Handle form submission
  const handleSubmit = async () => {
    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Call parent function with the name
    onConfirm(name.trim());
  };

  // Handle ESC key
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
    if (e.key === "Enter" && !error && name.length >= 2) {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} onClick={onClose} />
      
      {/* Modal */}
      <div className={styles.modal} onKeyDown={handleKeyDown}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>✨ Personalize Your Combo</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className={styles.modalBody}>
          {/* Selected Items Summary */}
          <div className={styles.itemsSummary}>
            <p className={styles.summaryText}>
              You've selected {selectedProducts.length} items for your combo!
            </p>
            <div className={styles.itemsList}>
              <p className={styles.itemsLabel}>📦 Selected Items:</p>
              {selectedProducts.map((item, index) => (
                <p key={index} className={styles.itemName}>
                  • {item.title}
                </p>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div className={styles.inputSection}>
            <label className={styles.inputLabel} htmlFor="personalization-name">
              👤 Enter Name for Personalization:
            </label>
            <input
              id="personalization-name"
              type="text"
              className={`${styles.nameInput} ${error ? styles.inputError : ''}`}
              placeholder="e.g., Aarav, Priya, Rohan"
              value={name}
              onChange={handleNameChange}
              autoFocus
              maxLength={20}
            />
            {error && <p className={styles.errorText}>{error}</p>}
            <p className={styles.helperText}>
              ℹ️ This name will be printed on all items in your combo
            </p>
          </div>

          {/* Pricing Summary */}
          <div className={styles.pricingSummary}>
            <div className={styles.discountBadge}>
              💰 Your Discount: {discount}% OFF
            </div>
            <div className={styles.priceRow}>
              <span>Original:</span>
              <span className={styles.originalPrice}>₹{totalPrice.toLocaleString()}</span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.finalLabel}>You Pay:</span>
              <span className={styles.finalPrice}>₹{finalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <button 
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Go Back
          </button>
          <button 
            className={styles.confirmBtn}
            onClick={handleSubmit}
            disabled={!!error || name.length < 2 || isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Proceed to Checkout →"}
          </button>
        </div>
      </div>
    </>
  );
}
