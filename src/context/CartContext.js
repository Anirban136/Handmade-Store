import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import ApiService from '../services/api';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        setCartItems([]);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Update item quantity
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

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Get cart count
  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Get cart total
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.discount > 0 
        ? item.price - (item.price * item.discount / 100)
        : item.price;
      return total + (price * item.quantity);
    }, 0);
  };

  // Get cart items for order
  const getOrderItems = () => {
    return cartItems.map(item => ({
      product: item.id,
      name: item.name,
      price: item.discount > 0 
        ? item.price - (item.price * item.discount / 100)
        : item.price,
      quantity: item.quantity,
      image: item.images?.[0]?.url || item.image
    }));
  };

  // Create order
  const createOrder = async (orderData) => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to place an order');
    }

    try {
      setLoading(true);
      setError(null);

      const orderItems = getOrderItems();
      const orderPayload = {
        ...orderData,
        orderItems,
        itemsPrice: getCartTotal(),
        taxPrice: getCartTotal() * 0.18, // 18% GST
        shippingPrice: getCartTotal() > 5000 ? 0 : 200, // Free shipping above ₹5000
        totalPrice: getCartTotal() + (getCartTotal() * 0.18) + (getCartTotal() > 5000 ? 0 : 200)
      };

      const response = await ApiService.createOrder(orderPayload);
      
      // Clear cart after successful order
      clearCart();
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check if product is in cart
  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  // Get item quantity in cart
  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const value = {
    cartItems,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getCartTotal,
    createOrder,
    isInCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 