import React from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaLock } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/priceFormatter';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();

  const calculateShipping = () => {
    const subtotal = getCartTotal();
    return subtotal >= 5000 ? 0 : 200; // Free shipping above ₹5000
  };

  const calculateTax = () => {
    return getCartTotal() * 0.18; // 18% GST
  };

  const calculateTotal = () => {
    return getCartTotal() + calculateTax() + calculateShipping();
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      alert('Please login to proceed with checkout');
      return;
    }
    alert('Proceeding to checkout...');
    // This would redirect to a checkout page or payment processor
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <Link to="/products" className="cta-button">
              <FaArrowLeft /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <Link to="/products" className="continue-shopping">
            <FaArrowLeft /> Continue Shopping
          </Link>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <img 
                  src={item.images?.[0]?.url || item.image} 
                  alt={item.name} 
                  className="cart-item-image" 
                />
                
                <div className="cart-item-details">
                  <h3 className="cart-item-title">{item.name}</h3>
                  <p className="cart-item-category">{item.category}</p>
                  <div className="cart-item-rating">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(item.ratings || 0) ? 'star filled' : 'star'}>
                        ★
                      </span>
                    ))}
                    <span className="rating-text">({item.numOfReviews || 0})</span>
                  </div>
                </div>

                <div className="cart-item-quantity">
                  <label>Quantity:</label>
                  <div className="quantity-controls">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= 10}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="cart-item-price">
                  <span className="price-per-item">
                    {formatPrice(item.discount > 0 ? item.price - (item.price * item.discount / 100) : item.price)} each
                  </span>
                  <span className="price-total">
                    {formatPrice((item.discount > 0 ? item.price - (item.price * item.discount / 100) : item.price) * item.quantity)}
                  </span>
                </div>

                <button 
                  className="remove-item-btn"
                  onClick={() => removeFromCart(item.id)}
                  aria-label="Remove item"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            
            <div className="summary-row">
              <span>Subtotal ({cartItems.reduce((total, item) => total + item.quantity, 0)} items):</span>
              <span>{formatPrice(getCartTotal())}</span>
            </div>
            
            <div className="summary-row">
              <span>Tax (18% GST):</span>
              <span>{formatPrice(calculateTax())}</span>
            </div>
            
            <div className="summary-row">
              <span>Shipping:</span>
              <span>{calculateShipping() === 0 ? 'Free' : formatPrice(calculateShipping())}</span>
            </div>
            
            {calculateShipping() > 0 && (
              <div className="free-shipping-notice">
                <p>Add {formatPrice(5000 - getCartTotal())} more for free shipping!</p>
              </div>
            )}
            
            <div className="summary-row total">
              <span>Total:</span>
              <span>{formatPrice(calculateTotal())}</span>
            </div>

            <button 
              className="checkout-btn"
              onClick={handleCheckout}
            >
              <FaLock /> Proceed to Checkout
            </button>

            <div className="cart-features">
              <div className="feature">
                <span className="feature-icon">🚚</span>
                <div>
                  <h4>Free Shipping</h4>
                  <p>On orders over $50</p>
                </div>
              </div>
              <div className="feature">
                <span className="feature-icon">🛡️</span>
                <div>
                  <h4>Secure Checkout</h4>
                  <p>Your data is protected</p>
                </div>
              </div>
              <div className="feature">
                <span className="feature-icon">↩️</span>
                <div>
                  <h4>Easy Returns</h4>
                  <p>30-day return policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 