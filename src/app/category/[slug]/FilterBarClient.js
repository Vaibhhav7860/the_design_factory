"use client";
import { useState, useMemo } from "react";
import ProductCard from "@/components/product/ProductCard";
import styles from "./category.module.css";
import filterStyles from "./filterbar.module.css";

export default function FilterBarClient({ products, minPrice, maxPrice }) {
  // Initialize price range with actual product prices
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);
  const [sortBy, setSortBy] = useState("newest");
  
  // Format price for display
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Apply price filter
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Apply sorting
    switch (sortBy) {
      case "newest":
        // Keep original order (newest first)
        break;
      case "oldest":
        result.reverse();
        break;
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    return result;
  }, [products, priceRange, sortBy]);

  const handlePriceChange = (e, index) => {
    const newRange = [...priceRange];
    newRange[index] = parseInt(e.target.value);
    
    // Ensure min doesn't exceed max and vice versa
    if (index === 0) {
      newRange[0] = Math.max(minPrice, Math.min(newRange[0], newRange[1]));
    } else {
      newRange[1] = Math.min(maxPrice, Math.max(newRange[1], newRange[0]));
    }
    
    setPriceRange(newRange);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  return (
    <>
      {/* Sidebar Filters */}
      <div className={filterStyles.filterSidebar}>
        {/* Price Filter Section */}
        <div className={filterStyles.filterSection}>
          <div className={filterStyles.filterHeader}>
            <h3 className={filterStyles.filterTitle}>PRICE</h3>
            <button 
              className={filterStyles.collapseBtn}
              title="Toggle price filter"
            >
              −
            </button>
          </div>

          {/* Price Range Slider */}
          <div className={filterStyles.sliderContainer}>
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={priceRange[0]}
              onChange={(e) => handlePriceChange(e, 0)}
              className={filterStyles.slider}
            />
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={priceRange[1]}
              onChange={(e) => handlePriceChange(e, 1)}
              className={filterStyles.slider}
            />
          </div>

          {/* Price Input Fields */}
          <div className={filterStyles.priceInputs}>
            <div className={filterStyles.inputGroup}>
              <span className={filterStyles.currency}>₹</span>
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => handlePriceChange(e, 0)}
                className={filterStyles.input}
                placeholder="0"
              />
            </div>
            <div className={filterStyles.inputGroup}>
              <span className={filterStyles.currency}>₹</span>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => handlePriceChange(e, 1)}
                className={filterStyles.input}
                placeholder={maxPrice}
              />
            </div>
          </div>
        </div>

        {/* Sort Filter Section */}
        <div className={filterStyles.filterSection}>
          <div className={filterStyles.filterHeader}>
            <h3 className={filterStyles.filterTitle}>SORT BY</h3>
            <button 
              className={filterStyles.collapseBtn}
              title="Toggle sort filter"
            >
              −
            </button>
          </div>

          <select
            value={sortBy}
            onChange={handleSortChange}
            className={filterStyles.sortSelect}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Products will be rendered in the main section */}
    </>
  );
}
