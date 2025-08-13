const fs = require('fs');
const path = require('path');

// Shared in-memory database
const inMemoryDB = {
  products: [
    {
      id: '1',
      name: 'Handcrafted Ceramic Mug',
      description: 'Beautiful hand-thrown ceramic mug with a rustic finish. Perfect for your morning coffee or tea. Each piece is unique with slight variations in color and texture.',
      price: 1999,
      category: 'Pottery',
      images: [{ url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop' }],
      stock: 15,
      isActive: true,
      featured: true,
      rating: 4.5,
      reviews: 12
    },
    {
      id: '2',
      name: 'Woven Cotton Throw Blanket',
      description: 'Soft, handwoven cotton throw blanket in warm earth tones. Perfect for adding texture and warmth to your living room or bedroom. Made with natural dyes.',
      price: 7499,
      category: 'Textiles',
      images: [{ url: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=400&fit=crop' }],
      stock: 8,
      isActive: true,
      featured: true,
      rating: 4.8,
      reviews: 8
    },
    {
      id: '3',
      name: 'Sterling Silver Pendant Necklace',
      description: 'Elegant sterling silver pendant necklace with a hand-carved design. Each piece is individually crafted and comes with a 18-inch chain. Perfect gift for any occasion.',
      price: 12499,
      category: 'Jewelry',
      images: [{ url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop' }],
      stock: 12,
      isActive: true,
      featured: false,
      rating: 4.7,
      reviews: 15
    },
    {
      id: '4',
      name: 'Wooden Cutting Board',
      description: 'Handcrafted wooden cutting board made from sustainable maple wood. Features a beautiful grain pattern and food-safe finish. Perfect for both display and use.',
      price: 3799,
      category: 'Kitchen',
      images: [{ url: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=400&fit=crop' }],
      stock: 20,
      isActive: true,
      featured: false,
      rating: 4.6,
      reviews: 18
    },
    {
      id: '5',
      name: 'Hand-Painted Canvas Art',
      description: 'Original hand-painted canvas artwork featuring abstract floral designs. Each piece is one-of-a-kind and signed by the artist. Ready to hang with gallery-quality framing.',
      price: 16999,
      category: 'Art',
      images: [{ url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop' }],
      stock: 3,
      isActive: true,
      featured: true,
      rating: 4.9,
      reviews: 5
    },
    {
      id: '6',
      name: 'Leather Journal',
      description: 'Hand-stitched leather journal with premium paper. Features a rustic brown leather cover with embossed details. Perfect for writing, sketching, or as a gift.',
      price: 2899,
      category: 'Stationery',
      images: [{ url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop' }],
      stock: 25,
      isActive: true,
      featured: false,
      rating: 4.4,
      reviews: 22
    },
    {
      id: '7',
      name: 'Hand-Knitted Scarf',
      description: 'Warm, hand-knitted scarf made from merino wool. Features a beautiful cable pattern and comes in various colors. Perfect for cold weather and makes a thoughtful gift.',
      price: 3299,
      category: 'Textiles',
      images: [{ url: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=400&fit=crop' }],
      stock: 18,
      isActive: true,
      featured: false,
      rating: 4.5,
      reviews: 16
    },
    {
      id: '8',
      name: 'Ceramic Planter Set',
      description: 'Set of three handcrafted ceramic planters in different sizes. Perfect for indoor plants or succulents. Each pot has drainage holes and comes with a saucer.',
      price: 5699,
      category: 'Home Decor',
      images: [{ url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop' }],
      stock: 10,
      isActive: true,
      featured: false,
      rating: 4.3,
      reviews: 14
    }
  ],
  orders: []
};

// Helper function to save products to file
const saveProducts = () => {
  try {
    console.log('💾 Saving products to file...');
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('✅ Created data directory:', dataDir);
    }
    
    const productsFile = path.join(dataDir, 'products.json');
    const dataToSave = {
      products: inMemoryDB.products,
      orders: inMemoryDB.orders,
      lastUpdated: new Date().toISOString()
    };
    
    fs.writeFileSync(productsFile, JSON.stringify(dataToSave, null, 2));
    console.log('✅ Products saved to file:', productsFile);
    console.log('📊 Saved', inMemoryDB.products.length, 'products');
    return true;
  } catch (error) {
    console.error('❌ Error saving products:', error);
    return false;
  }
};

// Helper function to load products from file
const loadProducts = () => {
  try {
    const productsFile = path.join(__dirname, 'data', 'products.json');
    if (fs.existsSync(productsFile)) {
      const data = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
      if (data.products && Array.isArray(data.products)) {
        inMemoryDB.products = data.products;
        console.log('✅ Loaded', data.products.length, 'products from file');
      }
      if (data.orders && Array.isArray(data.orders)) {
        inMemoryDB.orders = data.orders;
        console.log('✅ Loaded', data.orders.length, 'orders from file');
      }
    } else {
      console.log('ℹ️ No products.json file found, using default products');
    }
  } catch (error) {
    console.error('❌ Error loading products:', error);
    console.log('ℹ️ Using default products due to loading error');
  }
};

// Load products on startup
console.log('🔄 Loading products from database...');
loadProducts();
console.log('✅ Database initialized with', inMemoryDB.products.length, 'products');

// Export the shared database and functions
module.exports = {
  inMemoryDB,
  saveProducts,
  loadProducts
}; 