"use client";

import { createContext, useContext, useReducer, useEffect, useCallback, useState } from "react";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "tdf_cart";

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((item) => item.slug === action.payload.slug);
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.slug === action.payload.slug
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.slug !== action.payload),
      };
    case "UPDATE_QUANTITY":
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.slug !== action.payload.slug),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.slug === action.payload.slug
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case "UPDATE_ITEM":
      return {
        ...state,
        items: state.items.map((item) =>
          item.slug === action.payload.slug
            ? { ...item, ...action.payload.updates }
            : item
        ),
      };
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "LOAD_CART":
      return { ...state, items: action.payload };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  // Becomes true once we've read the cart from localStorage. Consumers
  // (e.g. the checkout page) must wait for this before deciding the cart
  // is "empty" — otherwise a page refresh sees the initial empty state
  // and wrongly bounces the user to /cart.
  const [hydrated, setHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: "LOAD_CART", payload: parsed });
      }
    } catch (e) {
      console.error("Failed to load cart:", e);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Save cart to localStorage on change — but only after the initial
  // load has run, so we never overwrite a stored cart with the empty
  // bootstrap state.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } catch (e) {
      console.error("Failed to save cart:", e);
    }
  }, [state.items, hydrated]);

  const addToCart = useCallback((product) => {
    dispatch({ type: "ADD_ITEM", payload: product });
  }, []);

  const removeFromCart = useCallback((productSlug) => {
    dispatch({ type: "REMOVE_ITEM", payload: productSlug });
  }, []);

  const updateQuantity = useCallback((slug, quantity) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { slug, quantity } });
  }, []);

  const updateCartItem = useCallback((slug, updates) => {
    dispatch({ type: "UPDATE_ITEM", payload: { slug, updates } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const cartCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  const comboCount = state.items
    .filter((item) => item.isComboItem)
    .reduce((sum, item) => sum + item.quantity, 0);

  const comboDiscountPercent = comboCount >= 5 ? 20 : comboCount >= 3 ? 10 : 0;

  const cartSubtotal = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const comboDiscount = state.items
    .filter((item) => item.isComboItem)
    .reduce((sum, item) => sum + Math.round((item.price * comboDiscountPercent / 100)) * item.quantity, 0);

  const cartTotal = cartSubtotal - comboDiscount;

  return (
    <CartContext.Provider
      value={{
        cart: state.items,
        cartHydrated: hydrated,
        cartCount,
        cartSubtotal,
        comboDiscount,
        comboDiscountPercent,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateCartItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
