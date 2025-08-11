import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaTrash, FaShoppingCart, FaStar } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/priceFormatter';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product);
    // Optionally remove from wishlist after adding to cart
    // removeFromWishlist(product.id);
  };

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
  };

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">My Wishlist</h1>
            <p>Your wishlist is empty</p>
          </div>
          <div className="empty-wishlist">
            <FaHeart size={64} className="empty-icon" />
            <h2>No items in your wishlist</h2>
            <p>Start adding products you love to your wishlist!</p>
            <Link to="/products" className="cta-button">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My Wishlist</h1>
          <p>You have {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} in your wishlist</p>
        </div>

        <div className="wishlist-actions">
          <button 
            className="clear-wishlist-btn"
            onClick={clearWishlist}
          >
            <FaTrash />
            Clear Wishlist
          </button>
        </div>

        <div className="wishlist-grid">
          {wishlist.map((product) => (
            <div key={product.id} className="wishlist-item">
              <div className="wishlist-item-image">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="wishlist-item-info">
                <h3 className="wishlist-item-title">{product.name}</h3>
                <div className="wishlist-item-rating">
                  {[...Array(5)].map((_, i) => (
                    <FaStar 
                      key={i} 
                      className={i < Math.floor(product.rating || 0) ? 'star filled' : 'star'} 
                    />
                  ))}
                  <span className="rating-text">({product.reviews || 0})</span>
                </div>
                <p className="wishlist-item-price">{formatPrice(product.price)}</p>
                <p className="wishlist-item-description">
                  {product.description.substring(0, 100)}...
                </p>
                <div className="wishlist-item-actions">
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(product)}
                  >
                    <FaShoppingCart />
                    Add to Cart
                  </button>
                  <button 
                    className="remove-wishlist-btn"
                    onClick={() => handleRemoveFromWishlist(product.id)}
                  >
                    <FaTrash />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="wishlist-footer">
          <Link to="/products" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist; 