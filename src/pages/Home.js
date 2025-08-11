import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaHeart, FaShippingFast, FaShieldAlt, FaHandshake } from 'react-icons/fa';
import { products } from '../data/products';
import { formatPrice } from '../utils/priceFormatter';
import { useCart } from '../context/CartContext';

const Home = () => {
  const { addToCart } = useCart();
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Handcrafted with Love</h1>
          <p>Discover unique, handmade treasures that bring warmth and character to your home. Each piece tells a story of craftsmanship and passion.</p>
          <Link to="/products" className="cta-button">
            Shop Our Collection
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <FaHeart className="feature-icon" />
              <h3>Handmade with Love</h3>
              <p>Every item is carefully crafted by skilled artisans who pour their heart into each creation.</p>
            </div>
            <div className="feature-card">
              <FaShippingFast className="feature-icon" />
              <h3>Fast Shipping</h3>
              <p>Free shipping on orders over ₹4,000. Your handmade treasures will arrive safely and quickly.</p>
            </div>
            <div className="feature-card">
              <FaShieldAlt className="feature-icon" />
              <h3>Quality Guaranteed</h3>
              <p>We stand behind every product. If you're not satisfied, we'll make it right.</p>
            </div>
            <div className="feature-card">
              <FaHandshake className="feature-icon" />
              <h3>Support Artisans</h3>
              <p>Your purchase directly supports independent artists and craftspeople.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="products-section">
        <h2 className="section-title">Featured Products</h2>
        <div className="products-grid">
          {featuredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <img src={product.image} alt={product.name} className="product-image" />
              <div className="product-info">
                <h3 className="product-title">{product.name}</h3>
                <div className="product-rating">
                  {[...Array(5)].map((_, i) => (
                    <FaStar 
                      key={i} 
                      className={i < Math.floor(product.rating) ? 'star filled' : 'star'} 
                    />
                  ))}
                  <span className="rating-text">({product.reviews})</span>
                </div>
                <p className="product-price">{formatPrice(product.price)}</p>
                <p className="product-description">{product.description.substring(0, 100)}...</p>
                <button className="add-to-cart-btn" onClick={() => addToCart(product)}>Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center" style={{ marginTop: '3rem' }}>
          <Link to="/products" className="cta-button">
            View All Products
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>Our Story</h2>
                              <p>
                  HandyCurv was born from a passion for authentic craftsmanship and a desire to connect 
                  people with beautiful, meaningful objects. We believe that every handmade item carries 
                  the energy and intention of its creator, making it truly special.
                </p>
                <p>
                  Our curated collection features the work of talented artisans from around the world, 
                  each piece carefully selected for its quality, beauty, and story. From hand-thrown pottery 
                  to hand-woven textiles, every item in our collection is made with care and attention to detail.
                </p>
              <Link to="/about" className="cta-button">
                Learn More About Us
              </Link>
            </div>
            <div className="about-image">
              <img 
                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=400&fit=crop" 
                alt="Handmade crafts" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h2>Stay Connected</h2>
            <p>Subscribe to our newsletter for updates on new products, artisan stories, and exclusive offers.</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Enter your email address" required />
              <button type="submit" className="cta-button">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 