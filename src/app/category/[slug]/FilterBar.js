"use client";
import { useState } from "react";
import styles from "./filterbar.module.css";

export default function FilterBar({ onPriceChange, onSortChange, minPrice = 0, maxPrice = 100000 }) {
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);
  const [sortBy, setSortBy] = useState("newest");

  const handlePriceChange = (e, index) => {
    const newRange = [...priceRange];
    newRange[index] = parseInt(e.target.value);
    setPriceRange(newRange);
    onPriceChange(newRange);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    onSortChange(e.target.value);
  };

  return (
    <div className={styles.filterBar}>
      {/* Sort Filter */}
      <div className={styles.sortSection}>
        <label htmlFor="sort" className={styles.label}>Sort by</label>
        <select 
          id="sort" 
          value={sortBy} 
          onChange={handleSortChange}
          className={styles.select}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      {/* Price Filter */}
      <div className={styles.priceSection}>
        <h3 className={styles.filterTitle}>PRICE</h3>
        
        {/* Price Range Slider */}
        <div className={styles.sliderContainer}>
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={priceRange[0]}
            onChange={(e) => handlePriceChange(e, 0)}
            className={styles.slider}
          />
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={priceRange[1]}
            onChange={(e) => handlePriceChange(e, 1)}
            className={styles.slider}
          />
        </div>

        {/* Price Input Fields */}
        <div className={styles.priceInputs}>
          <div className={styles.inputGroup}>
            <span className={styles.currency}>₹</span>
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => handlePriceChange(e, 0)}
              className={styles.input}
              placeholder="Min"
            />
          </div>
          <div className={styles.inputGroup}>
            <span className={styles.currency}>₹</span>
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => handlePriceChange(e, 1)}
              className={styles.input}
              placeholder="Max"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
