import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [itemLoadingMap, setItemLoadingMap] = useState({});
  const [error, setError] = useState(null);

  // Fetch cart from backend whenever authenticated
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/cart');
      setCart(res.data.cart || []);
    } catch (err) {
      console.error('Fetch cart error:', err);
      setError(err.response?.data?.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add to cart (or increment if exists)
  const addToCart = async (productId) => {
    try {
      setItemLoadingMap((prev) => ({ ...prev, [productId]: true }));
      const res = await api.post(`/cart/${productId}`);
      setCart(res.data.cart || []);
      return { success: true, message: res.data.message || 'Added to cart' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add item to cart';
      return { success: false, message: msg };
    } finally {
      setItemLoadingMap((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    try {
      setItemLoadingMap((prev) => ({ ...prev, [productId]: true }));
      const res = await api.patch(`/cart/${productId}`, { quantity });
      setCart(res.data.cart || []);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update quantity';
      return { success: false, message: msg };
    } finally {
      setItemLoadingMap((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      setItemLoadingMap((prev) => ({ ...prev, [productId]: true }));
      const res = await api.delete(`/cart/${productId}`);
      setCart(res.data.cart || []);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove item';
      return { success: false, message: msg };
    } finally {
      setItemLoadingMap((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // Clear global cart state (used after payment completion)
  const clearCartState = () => {
    setCart([]);
  };

  // Derived state: Total items count (sum of all quantities)
  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + (item.quantity || 0), 0);
  }, [cart]);

  // Derived state: Subtotal in rupees (sum of price * quantity)
  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + price * (item.quantity || 0);
    }, 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        itemLoadingMap,
        cartCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        fetchCart,
        clearCartState,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
