const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://handycurv.vercel.app',
        'https://handmade-store-anirban136.vercel.app',
        'https://handmade-store-git-main-anirban136.vercel.app',
        'https://handmade-store-anirban136.vercel.app',
        /^https:\/\/.*\.vercel\.app$/, // Allow any Vercel subdomain
        process.env.FRONTEND_URL
      ].filter(Boolean)
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// CORS debugging middleware
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// In-memory data storage
const inMemoryDB = {
  products: [
    {
      id: '1',
      name: 'Handcrafted Ceramic Mug',
      description: 'Beautiful hand-thrown ceramic mug with a rustic finish.',
      price: 1999,
      category: 'Pottery',
      images: [{ url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop' }],
      stock: 15,
      isActive: true,
      featured: true
    },
    {
      id: '2',
      name: 'Woven Cotton Throw Blanket',
      description: 'Soft, handwoven cotton throw blanket in warm earth tones.',
      price: 7499,
      category: 'Textiles',
      images: [{ url: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=400&fit=crop' }],
      stock: 8,
      isActive: true,
      featured: true
    },
    {
      id: '3',
      name: 'Sterling Silver Pendant Necklace',
      description: 'Elegant sterling silver pendant necklace with a hand-carved design.',
      price: 12499,
      category: 'Jewelry',
      images: [{ url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop' }],
      stock: 12,
      isActive: true,
      featured: false
    }
  ],
  orders: []
};

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

// Products API endpoints
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    products: inMemoryDB.products
  });
});

app.get('/api/products/:id', (req, res) => {
  const product = inMemoryDB.products.find(p => p.id === req.params.id);
  if (product) {
    res.json({
      success: true,
      product
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }
});

// Use auth routes
app.use('/api/auth', authRoutes);

// Use admin routes
app.use('/api/admin', adminRoutes);

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 HandyCurv Backend running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
}); 