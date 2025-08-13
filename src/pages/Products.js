import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaSearch, FaHeart, FaSpinner } from 'react-icons/fa';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/priceFormatter';

const Products = () => {
  const { products, loading, error, filters, fetchProducts, searchProducts, filterByCategory, clearFilters } = useProducts();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Categories from backend
  const categories = ['All', 'Pottery', 'Textiles', 'Jewelry', 'Kitchen', 'Art', 'Stationery', 'Home Decor'];

  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle search with debouncing
  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim()) {
      searchProducts(value);
    } else {
      clearFilters();
    }
  }, [searchProducts, clearFilters]);

  // Handle category filter
  const handleCategoryChange = useCallback((category) => {
    if (category === 'All') {
      clearFilters();
    } else {
      filterByCategory(category);
    }
  }, [clearFilters, filterByCategory]);

  // Memoize sorted products to prevent unnecessary re-renders
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [products, sortBy]);

  // Memoize the add to cart handler
  const handleAddToCart = useCallback((product) => {
    addToCart(product);
  }, [addToCart]);

  // Memoize the wishlist toggle handler
  const handleWishlistToggle = useCallback((e, product) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  }, [toggleWishlist]);

  return (
    <div className="products-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Our Handmade Collection</h1>
          <p>Discover unique, handcrafted treasures made with love and care</p>
          <div className="refresh-indicator">
            {loading && <FaSpinner className="spinner" />}
            <button 
              className="refresh-products-btn"
              onClick={() => fetchProducts()}
              disabled={loading}
              title="Refresh products"
            >
              {loading ? 'Refreshing...' : '🔄 Refresh'}
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="filters-section">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>

          <div className="filters">
            <div className="filter-group">
              <label htmlFor="category-filter">Category:</label>
              <select
                id="category-filter"
                value={filters.category || 'All'}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="filter-select"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="sort-filter">Sort by:</label>
              <select
                id="sort-filter"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="name">Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="loading-state">
            <FaSpinner className="spinner" />
            <p>Loading products...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p>Error: {error}</p>
            <button className="cta-button" onClick={clearFilters}>
              Try Again
            </button>
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && (
          <div className="results-info">
            <p>Showing {sortedProducts.length} products</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && sortedProducts.length > 0 ? (
          <div className="products-grid">
            {sortedProducts.map((product) => {
              const imageUrl = product.images && product.images.length > 0 ? product.images[0].url : undefined;
              
              // Debug logging
              console.log('Product:', product.name, 'Image URL:', imageUrl, 'Images array:', product.images);
              
              return (
                <div key={product.id} className="product-card">
                  <Link to={`/product/${product.id}`}>
                    <div className="product-image-container">
                      <img
                        src={imageUrl || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop"}
                        alt={product.name}
                        className="product-image"
                        onLoad={(e) => {
                          console.log('Image loaded successfully:', e.target.src);
                          e.target.classList.add('loaded');
                        }}
                        onError={(e) => {
                          console.error('Image failed to load:', e.target.src);
                          e.target.src = "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop";
                          e.target.classList.add('loaded');
                        }}
                        style={{ opacity: 1, maxWidth: '100%', height: 'auto' }}
                      />
                    </div>
                  </Link>
                  <div className="product-info">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="product-title">{product.name}</h3>
                    </Link>
                    <div className="product-rating">
                      {[...Array(5)].map((_, i) => (
                        <FaStar 
                          key={i} 
                          className={i < Math.floor((product.rating || 0)) ? 'star filled' : 'star'} 
                        />
                      ))}
                      <span className="rating-text">({product.reviews || 0})</span>
                    </div>
                    <p className="product-price">{formatPrice(product.price)}</p>
                    {product.discount && product.discount > 0 && (
                      <p className="product-discount">Save {product.discount}%</p>
                    )}
                    <p className="product-description">
                      {product.description && product.description.length > 120 
                        ? `${product.description.substring(0, 120)}...` 
                        : product.description || 'No description available'}
                    </p>
                    <div className="product-actions">
                      <button 
                        className="add-to-cart-btn" 
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </button>
                      <button 
                        className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                        onClick={(e) => handleWishlistToggle(e, product)}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <FaHeart />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : !loading && !error ? (
          <div className="no-results">
            <h3>No products found</h3>
            <p>Try adjusting your search or filter criteria</p>
            <button 
              className="cta-button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Products; 