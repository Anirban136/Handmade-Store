import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaSearch, FaHeart, FaSpinner } from 'react-icons/fa';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/priceFormatter';

const Products = () => {
  const { products, loading, error, filters, searchProducts, filterByCategory, clearFilters } = useProducts();
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Categories from backend
  const categories = ['All', 'Pottery', 'Textiles', 'Jewelry', 'Kitchen', 'Art', 'Stationery', 'Home Decor'];

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim()) {
      searchProducts(value);
    } else {
      clearFilters();
    }
  };

  // Handle category filter
  const handleCategoryChange = (category) => {
    if (category === 'All') {
      clearFilters();
    } else {
      filterByCategory(category);
    }
  };

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.ratings - a.ratings;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return (
    <div className="products-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Our Handmade Collection</h1>
          <p>Discover unique, handcrafted treasures made with love and care</p>
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
            {sortedProducts.map((product) => (
              <div key={product.id} className="product-card">
                <Link to={`/product/${product.id}`}>
                  <img 
                    src={product.images?.[0]?.url || product.image} 
                    alt={product.name} 
                    className="product-image" 
                  />
                </Link>
                <div className="product-info">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="product-title">{product.name}</h3>
                  </Link>
                  <div className="product-rating">
                    {[...Array(5)].map((_, i) => (
                      <FaStar 
                        key={i} 
                        className={i < Math.floor(product.ratings || 0) ? 'star filled' : 'star'} 
                      />
                    ))}
                    <span className="rating-text">({product.numOfReviews || 0})</span>
                  </div>
                  <p className="product-price">{formatPrice(product.price)}</p>
                  {product.discount > 0 && (
                    <p className="product-discount">Save {product.discount}%</p>
                  )}
                  <p className="product-description">{product.description.substring(0, 120)}...</p>
                  <div className="product-actions">
                    <button 
                      className="add-to-cart-btn" 
                      onClick={() => addToCart(product)}
                    >
                      Add to Cart
                    </button>
                    <button className="wishlist-btn">
                      <FaHeart />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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