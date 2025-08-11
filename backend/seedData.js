const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/handycurv')
  .then(() => console.log('✅ Connected to MongoDB for seeding'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Sample products data
const products = [
  {
    name: "Handcrafted Ceramic Mug",
    description: "Beautiful hand-thrown ceramic mug with a rustic finish. Perfect for your morning coffee or tea. Each piece is unique with slight variations in color and texture.",
    price: 1999,
    originalPrice: 2499,
    discount: 20,
    category: "Pottery",
    images: [{
      public_id: "ceramic_mug_1",
      url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop"
    }],
    stock: 15,
    materials: ["Clay", "Glaze"],
    dimensions: {
      height: 12,
      width: 8,
      unit: "cm"
    },
    weight: {
      value: 300,
      unit: "g"
    },
    shippingInfo: {
      weight: 300,
      dimensions: "12x8x8 cm",
      freeShipping: false,
      shippingCost: 200
    },
    tags: ["ceramic", "mug", "handmade", "coffee", "tea"],
    isActive: true,
    featured: true
  },
  {
    name: "Woven Cotton Throw Blanket",
    description: "Soft, handwoven cotton throw blanket in warm earth tones. Perfect for adding texture and warmth to your living room or bedroom. Made with natural dyes.",
    price: 7499,
    category: "Textiles",
    images: [{
      public_id: "cotton_blanket_1",
      url: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=400&fit=crop"
    }],
    stock: 8,
    materials: ["Cotton", "Natural Dyes"],
    dimensions: {
      length: 150,
      width: 100,
      unit: "cm"
    },
    weight: {
      value: 800,
      unit: "g"
    },
    shippingInfo: {
      weight: 800,
      dimensions: "150x100x5 cm",
      freeShipping: true,
      shippingCost: 0
    },
    tags: ["cotton", "blanket", "handwoven", "natural", "warm"],
    isActive: true,
    featured: true
  },
  {
    name: "Sterling Silver Pendant Necklace",
    description: "Elegant sterling silver pendant necklace with a hand-carved design. Each piece is individually crafted and comes with a 18-inch chain. Perfect gift for any occasion.",
    price: 12499,
    category: "Jewelry",
    images: [{
      public_id: "silver_necklace_1",
      url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop"
    }],
    stock: 12,
    materials: ["Sterling Silver", "Chain"],
    dimensions: {
      length: 45,
      width: 2,
      unit: "cm"
    },
    weight: {
      value: 25,
      unit: "g"
    },
    shippingInfo: {
      weight: 25,
      dimensions: "45x2x1 cm",
      freeShipping: false,
      shippingCost: 150
    },
    tags: ["silver", "necklace", "pendant", "jewelry", "handmade"],
    isActive: true,
    featured: false
  },
  {
    name: "Wooden Cutting Board",
    description: "Handcrafted wooden cutting board made from sustainable maple wood. Features a beautiful grain pattern and food-safe finish. Perfect for both display and use.",
    price: 3799,
    category: "Kitchen",
    images: [{
      public_id: "wooden_board_1",
      url: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=400&fit=crop"
    }],
    stock: 20,
    materials: ["Maple Wood", "Food-safe Oil"],
    dimensions: {
      length: 30,
      width: 20,
      height: 2,
      unit: "cm"
    },
    weight: {
      value: 500,
      unit: "g"
    },
    shippingInfo: {
      weight: 500,
      dimensions: "30x20x2 cm",
      freeShipping: false,
      shippingCost: 200
    },
    tags: ["wooden", "cutting board", "kitchen", "maple", "sustainable"],
    isActive: true,
    featured: false
  },
  {
    name: "Hand-Painted Canvas Art",
    description: "Original hand-painted canvas artwork featuring abstract floral designs. Each piece is one-of-a-kind and signed by the artist. Ready to hang with gallery-quality framing.",
    price: 16999,
    category: "Art",
    images: [{
      public_id: "canvas_art_1",
      url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop"
    }],
    stock: 3,
    materials: ["Canvas", "Acrylic Paint", "Wood Frame"],
    dimensions: {
      length: 60,
      width: 40,
      unit: "cm"
    },
    weight: {
      value: 2000,
      unit: "g"
    },
    shippingInfo: {
      weight: 2000,
      dimensions: "60x40x5 cm",
      freeShipping: true,
      shippingCost: 0
    },
    tags: ["art", "painting", "canvas", "original", "floral"],
    isActive: true,
    featured: true
  },
  {
    name: "Leather Journal",
    description: "Hand-stitched leather journal with premium paper. Features a rustic brown leather cover with embossed details. Perfect for writing, sketching, or as a gift.",
    price: 2899,
    category: "Stationery",
    images: [{
      public_id: "leather_journal_1",
      url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop"
    }],
    stock: 25,
    materials: ["Genuine Leather", "Premium Paper", "Thread"],
    dimensions: {
      length: 21,
      width: 15,
      height: 2,
      unit: "cm"
    },
    weight: {
      value: 400,
      unit: "g"
    },
    shippingInfo: {
      weight: 400,
      dimensions: "21x15x2 cm",
      freeShipping: false,
      shippingCost: 150
    },
    tags: ["leather", "journal", "notebook", "handmade", "writing"],
    isActive: true,
    featured: false
  },
  {
    name: "Hand-Knitted Scarf",
    description: "Warm, hand-knitted scarf made from merino wool. Features a beautiful cable pattern and comes in various colors. Perfect for cold weather and makes a thoughtful gift.",
    price: 3299,
    category: "Textiles",
    images: [{
      public_id: "knitted_scarf_1",
      url: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=400&fit=crop"
    }],
    stock: 18,
    materials: ["Merino Wool", "Natural Dyes"],
    dimensions: {
      length: 180,
      width: 20,
      unit: "cm"
    },
    weight: {
      value: 200,
      unit: "g"
    },
    shippingInfo: {
      weight: 200,
      dimensions: "180x20x2 cm",
      freeShipping: false,
      shippingCost: 150
    },
    tags: ["knitted", "scarf", "wool", "warm", "winter"],
    isActive: true,
    featured: false
  },
  {
    name: "Ceramic Planter Set",
    description: "Set of three handcrafted ceramic planters in different sizes. Perfect for indoor plants or succulents. Each pot has drainage holes and comes with a saucer.",
    price: 5699,
    category: "Home Decor",
    images: [{
      public_id: "ceramic_planters_1",
      url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop"
    }],
    stock: 10,
    materials: ["Clay", "Glaze", "Saucers"],
    dimensions: {
      height: 15,
      width: 12,
      unit: "cm"
    },
    weight: {
      value: 1200,
      unit: "g"
    },
    shippingInfo: {
      weight: 1200,
      dimensions: "15x12x12 cm",
      freeShipping: false,
      shippingCost: 250
    },
    tags: ["ceramic", "planters", "plants", "succulents", "home decor"],
    isActive: true,
    featured: false
  }
];

// Admin user data
const adminUser = {
  name: "Admin User",
  email: "admin@handycurv.com",
  password: "admin123",
  phone: "9876543210",
  address: {
    street: "123 Admin Street",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001"
  },
  role: "admin"
};

// Seed function
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create(adminUser);
    console.log('👤 Created admin user:', admin.email);

    // Create products with admin as artisan
    const productsWithArtisan = products.map(product => ({
      ...product,
      artisan: admin._id
    }));

    const createdProducts = await Product.create(productsWithArtisan);
    console.log(`🛍️  Created ${createdProducts.length} products`);

    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Sample Data:');
    console.log(`- Admin User: ${admin.email} (password: admin123)`);
    console.log(`- Products: ${createdProducts.length} items`);
    console.log(`- Categories: ${[...new Set(products.map(p => p.category))].join(', ')}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seed function
seedDatabase();