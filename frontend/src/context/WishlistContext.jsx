import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [itemLoadingMap, setItemLoadingMap] = useState({});
  const [error, setError] = useState(null);

  // Fetch wishlist from backend
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/wishlist');
      setWishlist(res.data.wishlist || []);
    } catch (err) {
      console.error('Fetch wishlist error:', err);
      setError(err.response?.data?.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Check if a product is in wishlist
  const isInWishlist = (productId) => {
    return wishlist.some((item) => (item._id || item) === productId);
  };

  // Toggle wishlist (Add or Remove)
  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      return { success: false, requireAuth: true, message: 'Please log in to use your wishlist' };
    }
    try {
      setItemLoadingMap((prev) => ({ ...prev, [productId]: true }));
      const res = await api.patch(`/wishlist/${productId}/toggle`);
      await fetchWishlist();
      return {
        success: true,
        isAdded: res.data.isAdded,
        message: res.data.message,
      };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update wishlist';
      return { success: false, message: msg };
    } finally {
      setItemLoadingMap((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // Remove directly
  const removeFromWishlist = async (productId) => {
    try {
      setItemLoadingMap((prev) => ({ ...prev, [productId]: true }));
      await api.delete(`/wishlist/${productId}`);
      setWishlist((prev) => prev.filter((item) => item._id !== productId));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to remove from wishlist' };
    } finally {
      setItemLoadingMap((prev) => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        loading,
        error,
        itemLoadingMap,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
