import React from 'react';
import { FaHeart, FaHandshake, FaLeaf, FaUsers, FaAward, FaGlobe } from 'react-icons/fa';

const About = () => {
  return (
    <div className="about-page">
      <div className="container">
        {/* Hero Section */}
        <div className="about-hero">
          <h1>Our Story</h1>
          <p>Connecting you with the world's most talented artisans and their beautiful creations</p>
        </div>

        {/* Mission Section */}
        <section className="mission-section">
          <div className="mission-content">
            <div className="mission-text">
              <h2>Our Mission</h2>
              <p>
                At HandyCurv, we believe that every handmade item carries the energy and intention 
                of its creator. Our mission is to bridge the gap between skilled artisans and people who 
                appreciate authentic, meaningful craftsmanship.
              </p>
              <p>
                We curate a collection of handcrafted treasures that not only beautify your home but also 
                tell stories of tradition, creativity, and human connection. Each piece in our collection 
                is carefully selected for its quality, beauty, and the story it represents.
              </p>
            </div>
            <div className="mission-image">
              <img 
                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=400&fit=crop" 
                alt="Artisan at work" 
              />
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="values-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <FaHeart className="value-icon" />
              <h3>Authenticity</h3>
              <p>Every item in our collection is genuinely handmade by skilled artisans who pour their heart and soul into their craft.</p>
            </div>
            <div className="value-card">
              <FaHandshake className="value-icon" />
              <h3>Fair Trade</h3>
              <p>We ensure that all our artisans receive fair compensation for their work and are treated with respect and dignity.</p>
            </div>
            <div className="value-card">
              <FaLeaf className="value-icon" />
              <h3>Sustainability</h3>
              <p>We prioritize eco-friendly materials and sustainable practices in all our partnerships and operations.</p>
            </div>
            <div className="value-card">
              <FaUsers className="value-icon" />
              <h3>Community</h3>
              <p>We build lasting relationships with our artisans and customers, creating a community of craft lovers.</p>
            </div>
          </div>
        </section>

        {/* Artisans Section */}
        <section className="artisans-section">
          <h2>Meet Our Artisans</h2>
          <div className="artisans-grid">
            <div className="artisan-card">
              <img 
                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop" 
                alt="Pottery artisan" 
              />
              <h3>Maria Santos</h3>
              <p className="artisan-craft">Pottery & Ceramics</p>
              <p>Maria has been creating beautiful ceramic pieces for over 20 years. Her work is inspired by traditional Spanish pottery techniques passed down through generations.</p>
            </div>
            <div className="artisan-card">
              <img 
                src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=300&h=300&fit=crop" 
                alt="Textile artisan" 
              />
              <h3>Ahmed Hassan</h3>
              <p className="artisan-craft">Textiles & Weaving</p>
              <p>Ahmed specializes in hand-woven textiles using traditional looms. His work combines ancient techniques with contemporary designs.</p>
            </div>
            <div className="artisan-card">
              <img 
                src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=300&h=300&fit=crop" 
                alt="Jewelry artisan" 
              />
              <h3>Sarah Chen</h3>
              <p className="artisan-craft">Jewelry & Metalwork</p>
              <p>Sarah creates stunning jewelry pieces using traditional metalworking techniques. Each piece is handcrafted with attention to detail.</p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <FaAward className="stat-icon" />
              <h3>500+</h3>
              <p>Happy Customers</p>
            </div>
            <div className="stat-card">
              <FaGlobe className="stat-icon" />
              <h3>15+</h3>
              <p>Countries Represented</p>
            </div>
            <div className="stat-card">
              <FaUsers className="stat-icon" />
              <h3>50+</h3>
              <p>Skilled Artisans</p>
            </div>
            <div className="stat-card">
              <FaHeart className="stat-icon" />
              <h3>1000+</h3>
              <p>Handcrafted Items</p>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="process-section">
          <h2>How We Work</h2>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <h3>Discover</h3>
              <p>We travel the world to discover talented artisans and their unique crafts.</p>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <h3>Collaborate</h3>
              <p>We work closely with artisans to develop products that meet our quality standards.</p>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <h3>Curate</h3>
              <p>Each item is carefully selected and tested to ensure it meets our high standards.</p>
            </div>
            <div className="process-step">
              <div className="step-number">4</div>
              <h3>Share</h3>
              <p>We bring these beautiful creations to you, along with the stories of the artisans who made them.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-content">
            <h2>Join Our Community</h2>
            <p>Be part of a movement that celebrates authentic craftsmanship and supports talented artisans around the world.</p>
            <div className="cta-buttons">
              <a href="/products" className="cta-button">Shop Our Collection</a>
              <a href="/contact" className="cta-button secondary">Get in Touch</a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About; 