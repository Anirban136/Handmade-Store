import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>HandyCurv</h3>
          <p>Creating beautiful, unique handmade products with love and care. Each piece tells a story and brings warmth to your home.</p>
          <div className="social-links">
            <a href="#" aria-label="Facebook"><FaFacebook size={20} /></a>
            <a href="#" aria-label="Instagram"><FaInstagram size={20} /></a>
            <a href="#" aria-label="Twitter"><FaTwitter size={20} /></a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact Info</h3>
          <p><FaEnvelope /> hello@handmadehaven.com</p>
          <p><FaPhone /> +1 (555) 123-4567</p>
          <p><FaMapMarkerAlt /> 123 Craft Street, Artisan City, AC 12345</p>
        </div>

        <div className="footer-section">
          <h3>Newsletter</h3>
          <p>Subscribe to get updates on new products and special offers!</p>
          <form className="newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 HandyCurv. All rights reserved. | Made with ❤️</p>
      </div>
    </footer>
  );
};

export default Footer; 