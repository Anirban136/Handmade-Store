const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

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
  users: [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@handycurv.com',
      password: '$2a$10$example_hash', // In real app, this would be hashed
      role: 'admin'
    }
  ],
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

console.log('✅ Using in-memory storage with sample data');

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

// User authentication endpoints
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email and password'
    });
  }
  
  const existingUser = inMemoryDB.users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists'
    });
  }
  
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password: '$2a$10$example_hash', // In real app, hash the password
    role: 'user'
  };
  
  inMemoryDB.users.push(newUser);
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }
  
  const user = inMemoryDB.users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
  
  // In real app, verify password hash
  if (password === 'password123') { // Simple demo password
    res.json({
      success: true,
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// User profile route
app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    user: {
      id: '1',
      name: 'Admin User',
      email: 'admin@handycurv.com',
      role: 'admin'
    }
  });
});

// Logout route
app.get('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
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