"use client";
import { useState } from "react";
import Image from "next/image";
import ProductCard from "@/components/product/ProductCard";
import { products } from "@/data/products";
import styles from "./page.module.css";

// Combo categories
const comboCategories = [
  { id: "bags", label: "Bags", image: "/images/categories/bags.png" },
  { id: "bottles", label: "Bottles", image: "/images/categories/organisers.png" },
  { id: "gift-tags", label: "Gift Tags", image: "/images/categories/gift_stationery.png" },
  { id: "tiffins", label: "Tiffins", image: "/images/categories/school.png" },
  { id: "money-envelopes", label: "Money Envelopes", image: "/images/categories/stationery.png" },
  { id: "labels", label: "Labels", image: "/images/categories/labels.png" },
  { id: "bag-tags", label: "Bag Tags", image: "/images/categories/kids_accessories.png" },
];

// Helper function to get products for combo categories
function getComboProducts(categoryId) {
  let filteredProducts = [];
  
  switch(categoryId) {
    case "bags":
      // Get products from bags category, excluding combos
      filteredProducts = products.filter(p => 
        p.categories?.includes("bags") && 
        !p.categories?.includes("combos") &&
        (p.subcategories?.includes("art-bags") || 
         p.subcategories?.includes("tote-bags") ||
         p.subcategories?.includes("swimming-bags") ||
         p.subcategories?.includes("duffle-bags"))
      );
      break;
      
    case "bottles":
      // Get sipper bottle products
      filteredProducts = products.filter(p => 
        p.subcategories?.includes("sipper-bottle")
      );
      break;
      
    case "gift-tags":
      // Get gift tag products
      filteredProducts = products.filter(p => 
        p.subcategories?.includes("3d-gift-tags") ||
        p.subcategories?.includes("3d-gift-tags-adults")
      );
      break;
      
    case "tiffins":
      // Get lunch box / tiffin products
      filteredProducts = products.filter(p => 
        p.subcategories?.includes("lunch-box")
      );
      break;
      
    case "money-envelopes":
      // Get money envelope products
      filteredProducts = products.filter(p => 
        p.subcategories?.includes("money-envelopes")
      );
      break;
      
    case "labels":
      // Get label products (excluding school book labels to keep it manageable)
      filteredProducts = products.filter(p => 
        p.categories?.includes("labels") &&
        (p.subcategories?.includes("rectangular-labels") ||
         p.subcategories?.includes("round-labels") ||
         p.subcategories?.includes("mixed-shape-labels") ||
         p.subcategories?.includes("transparent-labels"))
      );
      break;
      
    case "bag-tags":
      // Get bag tag products
      filteredProducts = products.filter(p => 
        p.subcategories?.includes("bag-tags")
      );
      break;
      
    default:
      filteredProducts = [];
  }
  
  // Limit to 30 products per category and format for display
  return filteredProducts.slice(0, 30).map(p => ({
    slug: p.slug,
    title: p.title,
    price: p.price,
    image: p.images?.[0] || "/images/products/art_bag_dinosaur.png",
    badge: p.badge,
  }));
}

export default function MakeComboPage() {
  const [activeCategory, setActiveCategory] = useState("bags");
  const [selectedProducts, setSelectedProducts] = useState([]);

  const categoryProducts = getComboProducts(activeCategory);

  const toggleProduct = (product) => {
    if (selectedProducts.find(p => p.slug === product.slug)) {
      setSelectedProducts(selectedProducts.filter(p => p.slug !== product.slug));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const isSelected = (product) => {
    return selectedProducts.some(p => p.slug === product.slug);
  };

  // Calculate discount
  const getDiscount = () => {
    const count = selectedProducts.length;
    if (count >= 5) return 20;
    if (count >= 3) return 10;
    return 0;
  };

  const totalPrice = selectedProducts.reduce((sum, p) => sum + p.price, 0);
  const discount = getDiscount();
  const finalPrice = totalPrice - (totalPrice * discount / 100);

  return (
    <main className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Make Your Own Combo</h1>
        <p className={styles.heroSubtitle}>
          Choose any 3 products and get 10% off • Choose 5+ and get 20% off
        </p>
      </section>

      {/* Category Circles */}
      <section className={styles.categories}>
        <div className={styles.categoryCircles}>
          {comboCategories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.categoryCircle} ${activeCategory === cat.id ? styles.active : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <div className={styles.circleImage}>
                <Image src={cat.image} alt={cat.label} width={120} height={120} />
              </div>
              <span className={styles.circleLabel}>{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Selected Products Summary */}
      {selectedProducts.length > 0 && (
        <div className={styles.summary}>
          <div className={styles.summaryInner}>
            <div className={styles.summaryText}>
              <strong>{selectedProducts.length} items selected</strong>
              {discount > 0 && <span className={styles.discountBadge}>{discount}% OFF Applied!</span>}
            </div>
            <div className={styles.summaryPrice}>
              {discount > 0 && <span className={styles.originalPrice}>₹{totalPrice}</span>}
              <span className={styles.finalPrice}>₹{finalPrice}</span>
            </div>
            <button className={styles.addToCartBtn}>Add Combo to Cart</button>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <section className={styles.productsSection}>
        <div className="container">
          <div className={styles.productsGrid}>
            {categoryProducts.map((product) => (
              <div 
                key={product.slug}
                className={`${styles.productWrapper} ${isSelected(product) ? styles.selected : ''}`}
                onClick={() => toggleProduct(product)}
              >
                {isSelected(product) && (
                  <div className={styles.selectedBadge}>✓ Selected</div>
                )}
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
