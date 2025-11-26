import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);

      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prevItems, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = typeof item.price === 'object' ? (item.price?.price || 0) : (item.price || 0);
      return total + (parseFloat(price) * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Get reserved quantity for a specific variant (quantity in cart)
  const getReservedQuantity = (variantId) => {
    const item = cartItems.find(i => i.variant_id === variantId || i.id === variantId);
    return item ? item.quantity : 0;
  };

  // Get available stock for display (actual stock - cart quantity)
  const getAvailableStock = (product, variant = null) => {
    if (product.has_variants && variant) {
      // For variant products
      const actualStock = variant.inventory?.[0]?.quantity || 0;
      const reserved = getReservedQuantity(variant.id);
      return Math.max(0, actualStock - reserved);
    } else {
      // For non-variant products
      const actualStock = product.inventory?.quantity || 0;
      const reserved = getReservedQuantity(product.id);
      return Math.max(0, actualStock - reserved);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        getReservedQuantity,
        getAvailableStock,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
