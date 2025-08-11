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
    console.log('Toggling wishlist for product:', product);
    console.log('Current wishlist:', wishlist);
    
    setWishlist(prev => {
      const existingItem = prev.find(item => String(item.id) === String(product.id));
      console.log('Existing item found:', existingItem);
      
      if (existingItem) {
        console.log('Removing from wishlist');
        return prev.filter(item => String(item.id) !== String(product.id));
      } else {
        console.log('Adding to wishlist');
        return [...prev, product];
      }
    });
  };

  // Check if item is in wishlist
  const isInWishlist = (productId) => {
    console.log('Checking if product ID is in wishlist:', productId);
    console.log('Current wishlist items:', wishlist.map(item => item.id));
    const result = wishlist.some(item => String(item.id) === String(productId));
    console.log('Is in wishlist:', result);
    return result;
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