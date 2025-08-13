const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Import shared database
const { inMemoryDB, saveProducts, loadProducts } = require('../database');

// Import utilities
// const imageCompressor = require('../utils/imageCompressor');
const { fileStorage } = require('../utils/fileStorage');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/products');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Maximum: 10MB
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      // Check minimum file size (10KB)
      if (file.size < 10 * 1024) {
        return cb(new Error('File size must be at least 10KB'));
      }
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

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
    const { name, description, price, category, stock, isActive, featured, images } = req.body;
    
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
      images: images && images.length > 0 ? images.map(url => ({ url })) : [{ url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop' }],
      stock: parseInt(stock) || 0,
      isActive: isActive !== undefined ? isActive : true,
      featured: featured || false,
      rating: 0,
      reviews: 0,
      createdAt: new Date().toISOString()
    };

    inMemoryDB.products.push(newProduct);
    
    console.log('🆕 Product added to inMemoryDB:', newProduct.id, newProduct.name);
    console.log('📊 Total products in database:', inMemoryDB.products.length);
    
    if (saveProducts()) {
      console.log('✅ Product saved to file successfully');
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product: newProduct
      });
    } else {
      console.log('❌ Failed to save product to file');
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
    
    // Handle images array properly
    if (updates.images) {
      updatedProduct.images = updates.images.map(url => ({ url }));
    }

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

// Manage product images
router.patch('/products/:id/images', (req, res) => {
  try {
    const { id } = req.params;
    const { images } = req.body;
    
    const product = inMemoryDB.products.find(p => p.id === id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: 'Images array is required'
      });
    }

    product.images = images.map(url => ({ url }));
    product.updatedAt = new Date().toISOString();
    
    if (saveProducts()) {
      res.json({
        success: true,
        message: 'Product images updated successfully',
        product
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to save changes'
      });
    }
  } catch (error) {
    console.error('Error updating product images:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product images'
    });
  }
});

// Upload product image with smart compression
router.post('/products/:id/upload-image', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { compressionQuality = 'auto', maxWidth, maxHeight } = req.body;
    
    const product = inMemoryDB.products.find(p => p.id === id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded.'
      });
    }

    const originalPath = req.file.path;
    const filename = path.basename(req.file.filename, path.extname(req.file.filename));
    const compressedPath = path.join(path.dirname(originalPath), `${filename}-compressed.webp`);
    
    // Compression options based on quality setting
    let compressionOptions = {};
    switch (compressionQuality) {
      case 'high':
        compressionOptions = { quality: 70, maxWidth: 800, maxHeight: 800 };
        break;
      case 'medium':
        compressionOptions = { quality: 85, maxWidth: 1000, maxHeight: 1000 };
        break;
      case 'low':
        compressionOptions = { quality: 95, maxWidth: 1200, maxHeight: 1200 };
        break;
      case 'auto':
      default:
        // Auto-detect based on file size
        const stats = fs.statSync(originalPath);
        const fileSizeMB = stats.size / (1024 * 1024);
        if (fileSizeMB > 3) {
          compressionOptions = { quality: 75, maxWidth: 800, maxHeight: 800 };
        } else if (fileSizeMB > 1) {
          compressionOptions = { quality: 85, maxWidth: 1000, maxHeight: 1000 };
        } else {
          compressionOptions = { quality: 90, maxWidth: 1200, maxHeight: 1200 };
        }
        break;
    }
    
    // Override with custom dimensions if provided
    if (maxWidth) compressionOptions.maxWidth = parseInt(maxWidth);
    if (maxHeight) compressionOptions.maxHeight = parseInt(maxHeight);
    
    // Compress the image
    // const compressionResult = await imageCompressor.compressImage(
    //   originalPath, 
    //   compressedPath, 
    //   compressionOptions
    // );
    
    // For now, just use the original file without compression
    const newImageUrl = `/uploads/products/${req.file.filename}`;
    product.images.push({ url: newImageUrl });
    product.updatedAt = new Date().toISOString();
    
    // Don't delete the original file - we need it for serving
    // fs.unlinkSync(originalPath);
    
    if (saveProducts()) {
      res.json({
        success: true,
        message: 'Image uploaded successfully (no compression)',
        product,
        compression: { success: false, reason: 'Compression disabled' }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to save product'
      });
    }
    return;
    
    // Original compression logic commented out
    /*
    if (!compressionResult.success) {
      // If compression fails, use original file
      const newImageUrl = `/uploads/products/${req.file.filename}`;
      product.images.push({ url: newImageUrl });
      product.updatedAt = new Date().toISOString();
      
      // Clean up original file
      fs.unlinkSync(originalPath);
      
      if (saveProducts()) {
        res.json({
          success: true,
          message: 'Image uploaded successfully (original file used)',
          product,
          compression: { success: false, reason: 'Compression failed' }
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to save product'
        });
      }
      return;
    }
    
    // Use compressed image
    const newImageUrl = `/uploads/products/${path.basename(compressedPath)}`;
    product.images.push({ url: newImageUrl });
    product.updatedAt = new Date().toISOString();
    
    // Clean up original file
    fs.unlinkSync(originalPath);
    
    if (saveProducts()) {
      res.json({
        success: true,
        message: 'Image uploaded and compressed successfully',
        product,
        compression: {
          success: true,
          originalSize: `${(compressionResult.originalSize / (1024 * 1024)).toFixed(2)} MB`,
          compressedSize: `${(compressionResult.compressedSize / (1024 * 1024)).toFixed(2)} MB`,
          compressionRatio: compressionResult.compressionRatio,
          dimensions: compressionResult.dimensions,
          format: compressionResult.format
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to save product'
      });
    }
    */
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image'
    });
  }
});

// Delete product image
router.delete('/products/:id/images/:imageIndex', (req, res) => {
  try {
    const { id, imageIndex } = req.params;
    const product = inMemoryDB.products.find(p => p.id === id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (imageIndex < 0 || imageIndex >= product.images.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image index'
      });
    }
    
    const deletedImage = product.images.splice(imageIndex, 1)[0];
    product.updatedAt = new Date().toISOString();
    
    if (saveProducts()) {
      res.json({
        success: true,
        message: 'Image deleted successfully',
        product
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to save product'
      });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image'
    });
  }
});

// Bulk upload images for a product with smart compression
router.post('/products/:id/upload-images', upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { compressionQuality = 'auto', maxWidth, maxHeight } = req.body;
    
    const product = inMemoryDB.products.find(p => p.id === id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded.'
      });
    }
    
    const compressionResults = [];
    const newImages = [];
    
    // Process each uploaded file
    for (const file of req.files) {
      const originalPath = file.path;
      const filename = path.basename(file.filename, path.extname(file.filename));
      const compressedPath = path.join(path.dirname(originalPath), `${filename}-compressed.webp`);
      
      // Compression options based on quality setting
      let compressionOptions = {};
      switch (compressionQuality) {
        case 'high':
          compressionOptions = { quality: 70, maxWidth: 800, maxHeight: 800 };
          break;
        case 'medium':
          compressionOptions = { quality: 85, maxWidth: 1000, maxHeight: 1000 };
          break;
        case 'low':
          compressionOptions = { quality: 95, maxWidth: 1200, maxHeight: 1200 };
          break;
        case 'auto':
        default:
          // Auto-detect based on file size
          const stats = fs.statSync(originalPath);
          const fileSizeMB = stats.size / (1024 * 1024);
          if (fileSizeMB > 3) {
            compressionOptions = { quality: 75, maxWidth: 800, maxHeight: 800 };
          } else if (fileSizeMB > 1) {
            compressionOptions = { quality: 85, maxWidth: 1000, maxHeight: 1000 };
          } else {
            compressionOptions = { quality: 90, maxWidth: 1200, maxHeight: 1200 };
          }
          break;
      }
      
      // Override with custom dimensions if provided
      if (maxWidth) compressionOptions.maxWidth = parseInt(maxWidth);
      if (maxHeight) compressionOptions.maxHeight = parseInt(maxHeight);
      
      // Compress the image
      // const compressionResult = await imageCompressor.compressImage(
      //   originalPath, 
      //   compressedPath, 
      //   compressionOptions
      // );
      
      // For now, just use the original file without compression
      const newImageUrl = `/uploads/products/${file.filename}`;
      newImages.push({ url: newImageUrl });
      compressionResults.push({
        filename: file.originalname,
        success: true,
        originalSize: `${(fs.statSync(originalPath).size / (1024 * 1024)).toFixed(2)} MB`,
        compressedSize: `${(fs.statSync(compressedPath).size / (1024 * 1024)).toFixed(2)} MB`,
        compressionRatio: 1, // No compression
        dimensions: { width: 0, height: 0 }, // No compression
        format: 'original'
      });
      
      // Clean up original file
      fs.unlinkSync(originalPath);
    }
    
    product.images.push(...newImages);
    product.updatedAt = new Date().toISOString();
    
    if (saveProducts()) {
      res.json({
        success: true,
        message: `${newImages.length} images uploaded successfully`,
        product,
        compression: {
          totalImages: req.files.length,
          successful: compressionResults.filter(r => r.success).length,
          failed: compressionResults.filter(r => !r.success).length,
          results: compressionResults
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to save product'
      });
    }
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images'
    });
  }
});

// Get all uploaded images for a product
router.get('/products/:id/images', (req, res) => {
  try {
    const { id } = req.params;
    const product = inMemoryDB.products.find(p => p.id === id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      images: product.images || []
    });
  } catch (error) {
    console.error('Error getting product images:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving product images'
    });
  }
});

// Simple file upload without compression (fallback)
router.post('/products/:id/upload-simple', upload.single('image'), (req, res) => {
  try {
    const { id } = req.params;
    const product = inMemoryDB.products.find(p => p.id === id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded.'
      });
    }

    const newImageUrl = `/uploads/products/${req.file.filename}`;
    product.images.push({ url: newImageUrl });
    product.updatedAt = new Date().toISOString();
    
    if (saveProducts()) {
      res.json({
        success: true,
        message: 'Image uploaded successfully',
        product
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to save product'
      });
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image'
    });
  }
});

// Simple bulk upload without compression (fallback)
router.post('/products/:id/upload-simple-bulk', upload.array('images', 10), (req, res) => {
  try {
    console.log('🖼️ Image upload request received');
    console.log('📁 Files received:', req.files ? req.files.length : 'No files');
    console.log('🔍 Product ID:', req.params.id);
    
    const { id } = req.params;
    const product = inMemoryDB.products.find(p => p.id === id);
    
    if (!product) {
      console.log('❌ Product not found in database');
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    console.log('✅ Product found:', product.name);
    
    if (!req.files || req.files.length === 0) {
      console.log('❌ No files in request');
      return res.status(400).json({
        success: false,
        message: 'No files uploaded.'
      });
    }
    
    console.log('📸 Processing files:', req.files.map(f => ({ name: f.originalname, size: f.size, path: f.path })));
    
    const newImages = req.files.map(file => ({
      url: `/uploads/products/${file.filename}`
    }));
    
    console.log('🖼️ New image URLs:', newImages);
    
    product.images.push(...newImages);
    product.updatedAt = new Date().toISOString();
    
    console.log('💾 Saving product to database...');
    
    if (saveProducts()) {
      console.log('✅ Product saved successfully');
      res.json({
        success: true,
        message: `${newImages.length} images uploaded successfully`,
        product
      });
    } else {
      console.log('❌ Failed to save product');
      res.status(500).json({
        success: false,
        message: 'Failed to save product'
      });
    }
  } catch (error) {
    console.error('❌ Error uploading images:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images'
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