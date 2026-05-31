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
  const [isClient, setIsClient] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Client-side only for iOS compatibility
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sync state when maxPrice prop changes
  useEffect(() => {
    if (isClient) {
      setPriceRange([0, maxPrice]);
    }
  }, [maxPrice, isClient]);

  // Lock body scroll when filter drawer is open (mobile only)
  useEffect(() => {
    if (filterDrawerOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [filterDrawerOpen]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    if (!isClient) return products;

    try {
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
    } catch (error) {
      console.error("Filter error:", error);
      return products;
    }
  }, [products, priceRange, sortBy, isClient]);

  const handlePriceChange = (e, index) => {
    try {
      const newRange = [...priceRange];
      newRange[index] = parseInt(e.target.value);
      
      if (index === 0) {
        newRange[0] = Math.max(0, Math.min(newRange[0], newRange[1])); // Min starts from 0
      } else {
        newRange[1] = Math.min(maxPrice, Math.max(newRange[1], newRange[0]));
      }
      
      setPriceRange(newRange);
    } catch (error) {
      console.error("Price change error:", error);
    }
  };

  const handleSortChange = (e) => {
    try {
      setSortBy(e.target.value);
    } catch (error) {
      console.error("Sort change error:", error);
    }
  };

  return (
    <>
      {/* Mobile Filter Drawer Overlay */}
      <div 
        className={`${filterStyles.filterOverlay} ${filterDrawerOpen ? filterStyles.filterOverlayOpen : ""}`}
        onClick={() => setFilterDrawerOpen(false)}
      />

      {/* Mobile Filter Drawer */}
      <aside className={`${filterStyles.filterDrawer} ${filterDrawerOpen ? filterStyles.filterDrawerOpen : ""}`}>
        <div className={filterStyles.filterDrawerHeader}>
          <h2 className={filterStyles.filterDrawerHeading}>FILTERS</h2>
          <button 
            className={filterStyles.filterDrawerCloseBtn}
            onClick={() => setFilterDrawerOpen(false)}
            aria-label="Close filters"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className={filterStyles.filterDrawerContent}>
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

        {/* Apply Button */}
        <div className={filterStyles.filterDrawerFooter}>
          <button 
            className={filterStyles.applyFiltersBtn}
            onClick={() => setFilterDrawerOpen(false)}
          >
            APPLY FILTERS
          </button>
        </div>
      </aside>

      <div className={styles.contentWrapper}>
        {/* Left Sidebar - Filters (Desktop Only) */}
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
        {/* Product count with filter button */}
        <div className={filterStyles.productCountWrapper}>
          <p className={filterStyles.productCount}>
            Showing <strong>{filteredAndSortedProducts.length}</strong> of {products.length} products
          </p>
          {/* Mobile Filter Button - Aligned with product count */}
          <button 
            className={filterStyles.mobileFilterBtn}
            onClick={() => setFilterDrawerOpen(true)}
            aria-label="Open filters"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="4" y1="8" x2="20" y2="8"/>
              <line x1="4" y1="16" x2="20" y2="16"/>
              <circle cx="8" cy="8" r="2" fill="currentColor"/>
              <circle cx="16" cy="16" r="2" fill="currentColor"/>
            </svg>
          </button>
        </div>
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
    </>
  );
}
