"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProductCard from "@/components/product/ProductCard";
import PersonalizationModal from "@/components/combo/PersonalizationModal";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
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
  
  // Limit to 30 products per category and format with full object preservation
  return filteredProducts.slice(0, 30).map(p => ({
    ...p,
    image: p.images?.[0] || p.image || "/images/products/art_bag_dinosaur.png",
  }));
}

export default function MakeComboPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("bags");
  const { cart, addToCart, removeFromCart, updateCartItem } = useCart();
  const [toastMessage, setToastMessage] = useState(null);
  const [toastTimeoutId, setToastTimeoutId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [comboId] = useState(() => `combo_${Date.now()}`);

  const categoryProducts = getComboProducts(activeCategory);

  const triggerToast = (message) => {
    if (toastTimeoutId) {
      clearTimeout(toastTimeoutId);
    }
    setToastMessage(message);
    const id = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
    setToastTimeoutId(id);
  };

  const selectedProducts = cart.filter(item => item.isComboItem);

  const isSelected = (product) => {
    return cart.some(item => item.slug === `${product.slug}__combo`);
  };

  const toggleProduct = (product) => {
    const comboSlug = `${product.slug}__combo`;
    if (isSelected(product)) {
      removeFromCart(comboSlug);
      triggerToast(`Removed "${product.title}" from your combo`);
    } else {
      addToCart({
        ...product,
        slug: comboSlug,
        isComboItem: true,
      });
      triggerToast(`Added "${product.title}" to your combo`);
    }
  };

  // Calculate discount and prices
  const totalCount = selectedProducts.reduce((sum, p) => sum + p.quantity, 0);
  
  const getDiscount = (count) => {
    if (count >= 5) return 20;
    if (count >= 3) return 10;
    return 0;
  };

  const totalPrice = selectedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const discount = getDiscount(totalCount);
  const finalPrice = totalPrice - Math.round(totalPrice * discount / 100);

  // Handle checkout button click
  const handleCheckoutClick = () => {
    if (selectedProducts.length < 3) {
      triggerToast("Please select at least 3 items for combo discount");
      return;
    }
    setShowModal(true);
  };

  // Handle modal confirmation
  const handleModalConfirm = (personalizationName) => {
    // Update all combo items with personalization name
    selectedProducts.forEach(item => {
      updateCartItem(item.slug, {
        personalizationName,
        comboId,
      });
    });
    
    setShowModal(false);
    router.push("/checkout"); // Redirect directly to checkout
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowModal(false);
  };

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

      {/* Floating Checkout Button */}
      {selectedProducts.length > 0 && (
        <div className={styles.floatingBar}>
          <button onClick={handleCheckoutClick} className={styles.floatingBtn}>
            View Cart & Checkout
            {totalCount > 0 && <span className={styles.floatingCount}>{totalCount}</span>}
          </button>
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
                {/* Custom Checkbox Overlay */}
                <div className={styles.checkboxContainer}>
                  <div className={styles.customCheckbox}>
                    <svg viewBox="0 0 24 24" className={styles.checkmark}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>

                <ProductCard product={product} disableLinks={true} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Toast Message */}
      {toastMessage && (
        <div className={styles.toast}>
          <div className={styles.toastContent}>
            <span className={styles.toastTick}>✓</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Personalization Modal */}
      <PersonalizationModal
        isOpen={showModal}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        selectedProducts={selectedProducts}
        discount={discount}
        totalPrice={totalPrice}
        finalPrice={finalPrice}
      />
    </main>
  );
}
