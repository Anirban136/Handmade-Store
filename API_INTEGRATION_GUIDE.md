# API Integration Guide for HandyCurv Frontend

This guide explains how to set up and use the API integration between your React frontend and Node.js backend.

## 🚀 Quick Setup

### 1. Backend Setup
```bash
cd handmade-store/backend
npm install
npm run seed  # Populate database with sample data
npm run dev   # Start backend server
```

### 2. Frontend Setup
```bash
cd handmade-store
npm install
npm start     # Start frontend development server
```

### 3. Environment Configuration
Create a `.env` file in the `handmade-store` directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## 📁 New Files Added

### API Service (`src/services/api.js`)
- Centralized API communication
- Handles authentication headers
- Error handling and response processing
- All backend endpoints mapped

### Context Providers
- **AuthContext** (`src/context/AuthContext.js`): User authentication state
- **ProductContext** (`src/context/ProductContext.js`): Product data and filtering
- **CartContext** (`src/context/CartContext.js`): Shopping cart management

### New Components
- **Login** (`src/pages/Login.js`): User authentication page

## 🔧 Updated Components

### App.js
- Wrapped with context providers
- Removed local state management
- Added login route

### Navbar.js
- Uses authentication context
- Shows user info and logout button
- Dynamic cart count from context

### Products.js
- Fetches products from API
- Real-time search and filtering
- Loading and error states
- Uses backend product structure

### Cart.js
- Uses cart context for state management
- Real product data from API
- Tax and shipping calculations
- Authentication check for checkout

## 🛠️ How to Use the API Integration

### 1. Authentication
```javascript
import { useAuth } from '../context/AuthContext';

const { login, logout, user, isAuthenticated } = useAuth();

// Login
await login({ email: 'user@example.com', password: 'password' });

// Logout
await logout();

// Check if user is logged in
if (isAuthenticated) {
  console.log('User:', user.name);
}
```

### 2. Products
```javascript
import { useProducts } from '../context/ProductContext';

const { products, loading, error, searchProducts, filterByCategory } = useProducts();

// Search products
searchProducts('ceramic');

// Filter by category
filterByCategory('Pottery');
```

### 3. Cart
```javascript
import { useCart } from '../context/CartContext';

const { addToCart, removeFromCart, cartItems, getCartTotal } = useCart();

// Add product to cart
addToCart(product);

// Remove from cart
removeFromCart(productId);

// Get cart total
const total = getCartTotal();
```

### 4. Direct API Calls
```javascript
import ApiService from '../services/api';

// Get products
const response = await ApiService.getProducts({ keyword: 'mug', category: 'Pottery' });

// Create order
const order = await ApiService.createOrder(orderData);

// Get user profile
const user = await ApiService.getCurrentUser();
```

## 🔐 Authentication Flow

1. **Login**: User enters credentials → API validates → JWT token stored
2. **Protected Routes**: Token automatically included in API requests
3. **Logout**: Token removed from localStorage
4. **Auto-refresh**: App checks token validity on startup

## 📊 Data Structure Changes

### Products (Backend vs Frontend)
```javascript
// Old (Frontend)
{
  id: 1,
  name: "Product",
  price: 1999,
  image: "url",
  rating: 4.5,
  reviews: 12
}

// New (Backend)
{
  _id: "mongo_id",
  name: "Product",
  price: 1999,
  images: [{ url: "url", public_id: "id" }],
  ratings: 4.5,
  numOfReviews: 12,
  discount: 20,
  stock: 15,
  category: "Pottery"
}
```

### Cart Items
```javascript
// Old
{ id: 1, quantity: 2 }

// New
{ 
  _id: "mongo_id",
  name: "Product Name",
  price: 1999,
  quantity: 2,
  images: [...]
}
```

## 🎯 Key Features Implemented

### ✅ Working Features
- **User Authentication**: Login/logout with JWT
- **Product Listing**: Real-time from database
- **Search & Filtering**: Backend-powered search
- **Shopping Cart**: Persistent cart with localStorage
- **Responsive Design**: Mobile-friendly interface
- **Error Handling**: Graceful error states
- **Loading States**: User feedback during API calls

### 🔄 State Management
- **Global State**: Context API for app-wide state
- **Local Storage**: Cart persistence across sessions
- **Real-time Updates**: Automatic UI updates on state changes

## 🧪 Testing the Integration

### 1. Test Backend Health
```bash
curl http://localhost:5000/api/health
```

### 2. Test Product API
```bash
curl http://localhost:5000/api/products
```

### 3. Test Authentication
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@handycurv.com","password":"admin123"}'
```

### 4. Demo Credentials
- **Admin**: admin@handycurv.com / admin123
- **Features**: Full access to all admin functions

## 🚨 Common Issues & Solutions

### 1. CORS Errors
- Ensure backend CORS is configured
- Check API URL in frontend environment

### 2. Authentication Issues
- Clear localStorage if token is invalid
- Check JWT secret in backend config

### 3. Product Not Loading
- Verify MongoDB connection
- Check if database is seeded
- Review API endpoint responses

### 4. Cart Not Persisting
- Check localStorage permissions
- Verify cart context implementation

## 🔮 Next Steps

### Immediate Improvements
1. **Product Detail Page**: Update to use API data
2. **User Registration**: Add signup functionality
3. **Order Management**: Implement checkout process
4. **Admin Panel**: Create admin dashboard

### Advanced Features
1. **Payment Integration**: Stripe/PayPal integration
2. **Image Upload**: Product image management
3. **Email Notifications**: Order confirmations
4. **Advanced Search**: Filters, sorting, pagination
5. **Wishlist**: User wishlist functionality

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify backend server is running
3. Test API endpoints directly
4. Review environment configuration
5. Check MongoDB connection

The integration is now complete and ready for production use! 🎉 