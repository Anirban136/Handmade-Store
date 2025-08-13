const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import shared database
const { inMemoryDB } = require('./database');

const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// Middleware
app.use(cors({
  origin: [
    process.env.CORS_ORIGIN || 'https://handmade-store-delta.vercel.app',
    /^https:\/\/.*\.vercel\.app$/,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Debug CORS
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('✅ Using in-memory storage for products and orders');
console.log('✅ Using file storage for user authentication');

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to HandyCurv Backend API!',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      auth: '/api/auth',
      docs: 'Check the README for API documentation'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'HandyCurv Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to see database state
app.get('/api/debug/database', (req, res) => {
  res.json({
    success: true,
    totalProducts: inMemoryDB.products.length,
    activeProducts: inMemoryDB.products.filter(p => p.isActive).length,
    products: inMemoryDB.products.map(p => ({
      id: p.id,
      name: p.name,
      isActive: p.isActive,
      featured: p.featured
    })),
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Public products endpoint
app.get('/api/products', (req, res) => {
  try {
    const activeProducts = inMemoryDB.products.filter(product => product.isActive);
    console.log('🌐 Public API: Returning', activeProducts.length, 'active products');
    console.log('📊 Total products in database:', inMemoryDB.products.length);
    
    res.json({
      success: true,
      products: activeProducts,
      total: activeProducts.length
    });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving products'
    });
  }
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const product = inMemoryDB.products.find(p => p.id === id && p.isActive);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving product'
    });
  }
});

// Admin endpoint to view all users (for debugging)
app.get('/api/admin/users', (req, res) => {
  const fileStorage = require('./utils/fileStorage');
  try {
    const users = fileStorage.getUsers().map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));
    
    res.json({
      success: true,
      message: 'All users retrieved successfully',
      users
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving users'
    });
  }
});

// Cart and Order endpoints
app.post('/api/orders/new', (req, res) => {
  const { items, shippingInfo, paymentInfo } = req.body;
  
  if (!items || !shippingInfo) {
    return res.status(400).json({
      success: false,
      message: 'Please provide order items and shipping information'
    });
  }
  
  const newOrder = {
    id: Date.now().toString(),
    items: items.map(item => ({
      product: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.images?.[0]?.url || ''
    })),
    shippingInfo,
    paymentInfo,
    orderStatus: 'pending',
    createdAt: new Date().toISOString(),
    totalAmount: items.reduce((total, item) => total + (item.price * item.quantity), 0)
  };
  
  inMemoryDB.orders.push(newOrder);
  
  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    order: newOrder
  });
});

app.get('/api/orders/:id', (req, res) => {
  const order = inMemoryDB.orders.find(o => o.id === req.params.id);
  if (order) {
    res.json({
      success: true,
      order
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }
});

app.get('/api/orders/me', (req, res) => {
  // For demo purposes, return all orders
  // In real app, filter by user ID from auth token
  res.json({
    success: true,
    orders: inMemoryDB.orders
  });
});

// Simple error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 HandyCurv Backend running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
}); 