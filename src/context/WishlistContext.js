import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (error) {
        console.error('Error parsing wishlist from localStorage:', error);
        setWishlist([]);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Add item to wishlist
  const addToWishlist = (product) => {
    setWishlist(prev => {
      if (prev.find(item => item.id === product.id)) {
        return prev; // Already in wishlist
      }
      return [...prev, product];
    });
  };

  // Remove item from wishlist
  const removeFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(item => String(item.id) !== String(productId)));
  };

  // Toggle wishlist item
  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const existingItemIndex = prev.findIndex(item => String(item.id) === String(product.id));
      
      if (existingItemIndex !== -1) {
        // Remove item if it exists
        const newWishlist = [...prev];
        newWishlist.splice(existingItemIndex, 1);
        return newWishlist;
      } else {
        // Add item if it doesn't exist
        return [...prev, product];
      }
    });
  };

  // Check if item is in wishlist
  const isInWishlist = (productId) => {
    return wishlist.some(item => String(item.id) === String(productId));
  };

  // Get wishlist count
  const getWishlistCount = () => {
    return wishlist.length;
  };

  // Clear wishlist
  const clearWishlist = () => {
    setWishlist([]);
  };

  const value = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    getWishlistCount,
    clearWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}; 