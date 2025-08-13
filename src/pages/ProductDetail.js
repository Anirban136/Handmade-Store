import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaHeart, FaShare, FaTruck, FaShieldAlt, FaUndo } from 'react-icons/fa';
import { useProducts } from '../context/ProductContext';
import { formatPrice } from '../utils/priceFormatter';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductDetail = () => {
  const { id } = useParams();
  const { getProduct } = useProducts();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const result = await getProduct(id);
        setProduct(result.product);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, getProduct]);
  
  if (loading) {
    return (
      <div className="container">
        <div className="loading-state">
          <p>Loading product...</p>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container">
        <div className="error-page">
          <h2>Product not found</h2>
          <p>The product you're looking for doesn't exist.</p>
          <Link to="/products" className="cta-button">Back to Products</Link>
        </div>
      </div>
    );
  }

  // Get product images from the API data
  const productImages = product.images && product.images.length > 0 
    ? product.images.map(img => img.url)
    : ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop'];

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert(`${quantity} ${product.name} added to cart!`);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };



  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link> / 
          <Link to="/products">Products</Link> / 
          <span>{product.name}</span>
        </div>

        <div className="product-detail-content">
          {/* Product Images */}
          <div className="product-images">
            <div className="main-image">
              <img 
                src={productImages[selectedImage]} 
                alt={product.name} 
                style={{ opacity: 1 }}
              />
            </div>
            <div className="image-thumbnails">
              {productImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className={selectedImage === index ? 'active' : ''}
                  onClick={() => setSelectedImage(index)}
                  style={{ opacity: 1 }}
                />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info-detail">
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-rating">
              {[...Array(5)].map((_, i) => (
                <FaStar 
                  key={i} 
                  className={i < Math.floor((product.rating || 0)) ? 'star filled' : 'star'} 
                />
              ))}
              <span className="rating-text">{product.rating || 0} ({product.reviews || 0} reviews)</span>
            </div>

            <div className="product-price">{formatPrice(product.price)}</div>
            
            <div className="product-category">
              <strong>Category:</strong> {product.category}
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            <div className="product-availability">
              <span className={`status ${(product.stock && product.stock > 0) ? 'in-stock' : 'out-of-stock'}`}>
                {(product.stock && product.stock > 0) ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="product-actions">
              <div className="quantity-selector">
                <label htmlFor="quantity">Quantity:</label>
                <div className="quantity-controls">
                  <button 
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    min="1"
                    max="10"
                  />
                  <button 
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= 10}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="action-buttons">
                <button 
                  className="add-to-cart-btn large"
                  onClick={handleAddToCart}
                  disabled={!(product.stock && product.stock > 0)}
                >
                  Add to Cart
                </button>
                <button 
                  className={`wishlist-btn large ${isInWishlist(product.id) ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWishlist(product);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <FaHeart />
                </button>
                <button className="share-btn large">
                  <FaShare />
                </button>
              </div>
            </div>

            {/* Product Features */}
            <div className="product-features">
              <div className="feature">
                <FaTruck />
                <div>
                  <h4>Free Shipping</h4>
                  <p>On orders over ₹4,000</p>
                </div>
              </div>
              <div className="feature">
                <FaShieldAlt />
                <div>
                  <h4>Quality Guaranteed</h4>
                  <p>30-day return policy</p>
                </div>
              </div>
              <div className="feature">
                <FaUndo />
                <div>
                  <h4>Easy Returns</h4>
                  <p>Hassle-free returns</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="related-products">
          <h2>You might also like</h2>
          <div className="products-grid">
            {/* Assuming products are available in the context or fetched elsewhere */}
            {/* For now, we'll use a placeholder or fetch related products */}
            {/* Example: products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3) */}
            {/* This part needs to be implemented based on how related products are managed */}
            {/* For now, we'll just show a placeholder or remove if not available */}
            <p>Related products feature is under development.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 