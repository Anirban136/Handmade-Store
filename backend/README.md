# HandyCurv Backend API

A complete backend API for the HandyCurv handmade products e-commerce platform built with Node.js, Express, and MongoDB.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access
- 🛍️ **Product Management** - CRUD operations with search, filtering, and pagination
- 📦 **Order Management** - Complete order lifecycle with status tracking
- 👥 **User Management** - User profiles, admin functions, and statistics
- ⭐ **Review System** - Product reviews and ratings
- 🛡️ **Security** - Password encryption, input validation, error handling
- 📧 **Email Integration** - Ready for order notifications (configure SMTP)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Email**: Nodemailer
- **Validation**: Mongoose schema validation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   cd handmade-store/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `config.env` and update with your values:
   ```bash
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/handycurv

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=7d
   COOKIE_EXPIRE=7

   # Email Configuration (optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password

   # File Upload Configuration
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=uploads
   ```

4. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in config.env
   ```

5. **Run the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /logout` - User logout
- `GET /me` - Get current user profile
- `PUT /me/update` - Update user profile
- `PUT /password/update` - Update password

### Products (`/api/products`)
- `GET /` - Get all products (with search, filter, pagination)
- `GET /:id` - Get single product
- `POST /new` - Create new product (ADMIN)
- `PUT /:id` - Update product (ADMIN)
- `DELETE /:id` - Delete product (ADMIN)
- `PUT /review` - Add/update product review
- `GET /reviews/:id` - Get product reviews
- `DELETE /reviews` - Delete review

### Orders (`/api/orders`)
- `POST /new` - Create new order
- `GET /:id` - Get single order
- `GET /me` - Get user's orders
- `GET /admin/all` - Get all orders (ADMIN)
- `PUT /admin/:id` - Update order status (ADMIN)
- `DELETE /:id` - Delete order
- `PUT /:id/cancel` - Cancel order
- `PUT /:id/return` - Request return

### Users (`/api/users`)
- `GET /admin/all` - Get all users (ADMIN)
- `GET /admin/:id` - Get user details (ADMIN)
- `PUT /admin/:id` - Update user (ADMIN)
- `DELETE /admin/:id` - Delete user (ADMIN)
- `GET /profile` - Get user profile
- `PUT /profile/update` - Update profile
- `GET /admin/stats` - Get user statistics (ADMIN)

## Database Models

### User Model
- Basic info (name, email, phone, address)
- Role-based access (user/admin)
- Password encryption
- Email verification support
- Password reset functionality

### Product Model
- Product details (name, description, price)
- Category classification
- Image management
- Stock tracking
- Review system
- Handmade-specific fields (materials, dimensions, artisan)

### Order Model
- Order items with product details
- Shipping address
- Payment information
- Order status tracking
- Price calculations (items, tax, shipping)
- Return/refund support

## Security Features

- **Password Encryption**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Mongoose schema validation
- **Error Handling**: Centralized error management
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Ready for implementation
- **SQL Injection Protection**: Mongoose ODM

## File Structure

```
backend/
├── config.env              # Environment variables
├── server.js               # Main server file
├── package.json            # Dependencies
├── middleware/             # Custom middleware
│   ├── auth.js            # Authentication middleware
│   ├── errorHandler.js    # Error handling
│   └── asyncError.js      # Async error wrapper
├── models/                 # Database models
│   ├── User.js            # User model
│   ├── Product.js         # Product model
│   └── Order.js           # Order model
├── routes/                 # API routes
│   ├── auth.js            # Authentication routes
│   ├── products.js        # Product routes
│   ├── orders.js          # Order routes
│   └── users.js           # User routes
├── utils/                  # Utility functions
│   ├── errorHandler.js    # Error handler class
│   └── sendToken.js       # JWT token utility
└── uploads/               # File uploads directory
```

## Development

### Adding New Features
1. Create model in `models/` directory
2. Add routes in `routes/` directory
3. Update server.js to include new routes
4. Add middleware if needed

### Testing
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test product listing
curl http://localhost:5000/api/products
```

### Environment Variables
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRE`: JWT token expiration time
- `EMAIL_*`: SMTP configuration for emails

## Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure production MongoDB
- [ ] Set up proper CORS origins
- [ ] Configure email service
- [ ] Set up file upload storage
- [ ] Add rate limiting
- [ ] Configure logging

### Deployment Options
- **Heroku**: Easy deployment with MongoDB Atlas
- **AWS**: EC2 with MongoDB or DocumentDB
- **DigitalOcean**: Droplet with MongoDB
- **Vercel**: Serverless deployment

## Support

For issues and questions:
1. Check the API documentation
2. Review error logs
3. Test endpoints with Postman/curl
4. Verify database connection
5. Check environment variables

## License

This project is part of the HandyCurv e-commerce platform. 