import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaHeart, FaShare, FaTruck, FaShieldAlt, FaUndo } from 'react-icons/fa';
import { products } from '../data/products';
import { formatPrice } from '../utils/priceFormatter';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  
  useEffect(() => {
    const foundProduct = products.find(p => p.id === parseInt(id));
    setProduct(foundProduct);
    // Initialize wishlist with product if it's in stock
    if (foundProduct && foundProduct.inStock) {
      setWishlist(prev => [...prev, foundProduct.id]);
    }
  }, [id]);
  
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

  // Mock additional images for gallery
  const productImages = [
    product.image,
    product.image.replace('w=400&h=400', 'w=400&h=400&fit=crop&crop=center'),
    product.image.replace('w=400&h=400', 'w=400&h=400&fit=crop&crop=top'),
    product.image.replace('w=400&h=400', 'w=400&h=400&fit=crop&crop=bottom')
  ];

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    alert(`${quantity} ${product.name} added to cart!`);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
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
              <img src={productImages[selectedImage]} alt={product.name} />
            </div>
            <div className="image-thumbnails">
              {productImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className={selectedImage === index ? 'active' : ''}
                  onClick={() => setSelectedImage(index)}
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
                  className={i < Math.floor(product.rating) ? 'star filled' : 'star'} 
                />
              ))}
              <span className="rating-text">{product.rating} ({product.reviews} reviews)</span>
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
              <span className={`status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
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
                  disabled={!product.inStock}
                >
                  Add to Cart
                </button>
                <button 
                  className={`wishlist-btn large ${wishlist.includes(product.id) ? 'active' : ''}`}
                  onClick={() => toggleWishlist(product.id)}
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
            {products
              .filter(p => p.category === product.category && p.id !== product.id)
              .slice(0, 3)
              .map((relatedProduct) => (
                <div key={relatedProduct.id} className="product-card">
                  <Link to={`/product/${relatedProduct.id}`}>
                    <img src={relatedProduct.image} alt={relatedProduct.name} className="product-image" />
                  </Link>
                  <div className="product-info">
                    <Link to={`/product/${relatedProduct.id}`}>
                      <h3 className="product-title">{relatedProduct.name}</h3>
                    </Link>
                                        <p className="product-price">{formatPrice(relatedProduct.price)}</p>
                    <div className="product-actions">
                      <button 
                        className="add-to-cart-btn" 
                        onClick={() => addToCart(relatedProduct)}
                      >
                        Add to Cart
                      </button>
                      <button 
                        className={`wishlist-btn ${wishlist.includes(relatedProduct.id) ? 'active' : ''}`}
                        onClick={() => toggleWishlist(relatedProduct.id)}
                      >
                        <FaHeart />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 