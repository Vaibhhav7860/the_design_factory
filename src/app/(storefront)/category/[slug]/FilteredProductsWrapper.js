"use client";
import { useState, useMemo, useEffect } from "react";
import ProductCard from "@/components/product/ProductCard";
import styles from "./category.module.css";
import filterStyles from "./filterbar.module.css";

export default function FilteredProductsWrapper({ products, minPrice, maxPrice }) {
  const [priceRange, setPriceRange] = useState([0, maxPrice]); // Always start from 0
  const [sortBy, setSortBy] = useState("newest");
  const [priceOpen, setPriceOpen] = useState(true);
  const [sortOpen, setSortOpen] = useState(true);

  // Sync state when maxPrice prop changes
  useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

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
    
    if (index === 0) {
      newRange[0] = Math.max(0, Math.min(newRange[0], newRange[1])); // Min starts from 0
    } else {
      newRange[1] = Math.min(maxPrice, Math.max(newRange[1], newRange[0]));
    }
    
    setPriceRange(newRange);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  return (
    <div className={styles.contentWrapper}>
      {/* Left Sidebar - Filters */}
      <aside className={styles.filterSidebar}>
        <div className={filterStyles.filterSidebar}>
          {/* Price Filter Section */}
          <div className={filterStyles.filterSection}>
            <div className={filterStyles.filterHeader}>
              <h3 className={filterStyles.filterTitle}>PRICE</h3>
              <button 
                className={filterStyles.collapseBtn}
                onClick={() => setPriceOpen(!priceOpen)}
                title="Toggle price filter"
                style={{ transform: priceOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
              >
                −
              </button>
            </div>

            {priceOpen && (
              <>
                {/* Price Range Slider */}
                <div className={filterStyles.sliderContainer}>
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    value={priceRange[0]}
                    onChange={(e) => handlePriceChange(e, 0)}
                    className={filterStyles.slider}
                  />
                  <input
                    type="range"
                    min={0}
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
              </>
            )}
          </div>

          {/* Sort Filter Section */}
          <div className={filterStyles.filterSection}>
            <div className={filterStyles.filterHeader}>
              <h3 className={filterStyles.filterTitle}>SORT BY</h3>
              <button 
                className={filterStyles.collapseBtn}
                onClick={() => setSortOpen(!sortOpen)}
                title="Toggle sort filter"
                style={{ transform: sortOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
              >
                −
              </button>
            </div>

            {sortOpen && (
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
            )}
          </div>
        </div>
      </aside>

      {/* Right Content - Products */}
      <main className={styles.productsSection}>
        <p className={filterStyles.productCount}>
          Showing <strong>{filteredAndSortedProducts.length}</strong> of {products.length} products
        </p>
        <div className={styles.grid}>
          {filteredAndSortedProducts.length > 0 ? (
            filteredAndSortedProducts.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))
          ) : (
            <div className={styles.noProducts}>
              <p>No products found matching your filters. Try adjusting your price range.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
