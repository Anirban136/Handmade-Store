const express = require('express');
const router = express.Router();
const fileStorage = require('../utils/fileStorage');
const path = require('path');
const fs = require('fs');

// In-memory data storage (shared with server.js)
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

// Helper function to save products to file
const saveProducts = () => {
  try {
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const productsFile = path.join(dataDir, 'products.json');
    fs.writeFileSync(productsFile, JSON.stringify(inMemoryDB, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving products:', error);
    return false;
  }
};

// Helper function to load products from file
const loadProducts = () => {
  try {
    const productsFile = path.join(__dirname, '../data/products.json');
    if (fs.existsSync(productsFile)) {
      const data = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
      inMemoryDB.products = data.products || inMemoryDB.products;
      inMemoryDB.orders = data.orders || inMemoryDB.orders;
    }
  } catch (error) {
    console.error('Error loading products:', error);
  }
};

// Load products on startup
loadProducts();

// ===== PRODUCT MANAGEMENT =====

// Get all products (admin view)
router.get('/products', (req, res) => {
  try {
    res.json({
      success: true,
      products: inMemoryDB.products,
      total: inMemoryDB.products.length
    });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving products'
    });
  }
});

// Add new product
router.post('/products', (req, res) => {
  try {
    const { name, description, price, category, stock, isActive, featured } = req.body;
    
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description, price, and category'
      });
    }

    const newProduct = {
      id: Date.now().toString(),
      name,
      description,
      price: parseInt(price),
      category,
      images: [{ url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop' }], // Default image
      stock: parseInt(stock) || 0,
      isActive: isActive !== undefined ? isActive : true,
      featured: featured || false,
      createdAt: new Date().toISOString()
    };

    inMemoryDB.products.push(newProduct);
    
    if (saveProducts()) {
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product: newProduct
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to save product'
      });
    }
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product'
    });
  }
});

// Update product
router.put('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const productIndex = inMemoryDB.products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update product fields
    const updatedProduct = {
      ...inMemoryDB.products[productIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Ensure price and stock are numbers
    if (updates.price) updatedProduct.price = parseInt(updates.price);
    if (updates.stock) updatedProduct.stock = parseInt(updates.stock);

    inMemoryDB.products[productIndex] = updatedProduct;
    
    if (saveProducts()) {
      res.json({
        success: true,
        message: 'Product updated successfully',
        product: updatedProduct
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to save product'
      });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product'
    });
  }
});

// Delete product
router.delete('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const productIndex = inMemoryDB.products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const deletedProduct = inMemoryDB.products.splice(productIndex, 1)[0];
    
    if (saveProducts()) {
      res.json({
        success: true,
        message: 'Product deleted successfully',
        product: deletedProduct
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to save changes'
      });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product'
    });
  }
});

// Toggle product featured status
router.patch('/products/:id/featured', (req, res) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;
    
    const product = inMemoryDB.products.find(p => p.id === id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.featured = featured;
    product.updatedAt = new Date().toISOString();
    
    if (saveProducts()) {
      res.json({
        success: true,
        message: `Product ${featured ? 'featured' : 'unfeatured'} successfully`,
        product
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to save changes'
      });
    }
  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product'
    });
  }
});

// ===== USER MANAGEMENT =====

// Get all users
router.get('/users', (req, res) => {
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
      users,
      total: users.length
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving users'
    });
  }
});

// Update user role
router.patch('/users/:id/role', (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "admin" or "user"'
      });
    }

    const updatedUser = fileStorage.updateUser(id, { role });
    
    if (updatedUser) {
      res.json({
        success: true,
        message: 'User role updated successfully',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role'
    });
  }
});

// ===== ORDER MANAGEMENT =====

// Get all orders
router.get('/orders', (req, res) => {
  try {
    res.json({
      success: true,
      orders: inMemoryDB.orders,
      total: inMemoryDB.orders.length
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving orders'
    });
  }
});

// Update order status
router.patch('/orders/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;
    
    const order = inMemoryDB.orders.find(o => o.id === id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.orderStatus = orderStatus;
    order.updatedAt = new Date().toISOString();
    
    if (saveProducts()) {
      res.json({
        success: true,
        message: 'Order status updated successfully',
        order
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to save changes'
      });
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status'
    });
  }
});

// ===== DASHBOARD STATISTICS =====

// Get admin dashboard statistics
router.get('/stats', (req, res) => {
  try {
    const users = fileStorage.getUsers();
    const products = inMemoryDB.products;
    const orders = inMemoryDB.orders;
    
    const stats = {
      totalUsers: users.length,
      totalProducts: products.length,
      totalOrders: orders.length,
      featuredProducts: products.filter(p => p.featured).length,
      activeProducts: products.filter(p => p.isActive).length,
      pendingOrders: orders.filter(o => o.orderStatus === 'pending').length,
      completedOrders: orders.filter(o => o.orderStatus === 'completed').length,
      totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving statistics'
    });
  }
});

module.exports = router; 