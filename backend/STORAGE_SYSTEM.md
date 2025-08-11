# Storage System Documentation

## Overview
This backend uses a **hybrid storage approach**:
- **Products & Orders**: In-memory storage (temporary, resets on restart)
- **User Authentication**: File-based JSON storage (persistent)

## File Storage System

### Location
- **Data File**: `backend/data/users.json`
- **Created Automatically**: When the server starts for the first time

### Structure
```json
{
  "users": [
    {
      "id": "1",
      "name": "Admin User",
      "email": "admin@handycurv.com",
      "password": "$2a$10$example_hash",
      "role": "admin",
      "phone": "",
      "address": {},
      "createdAt": "2025-08-11T12:00:00.000Z",
      "lastLogin": "2025-08-11T12:00:00.000Z"
    }
  ],
  "lastUserId": 1
}
```

### Features
- ✅ **Persistent**: Data survives server restarts
- ✅ **Automatic**: Creates default admin user if file doesn't exist
- ✅ **Safe**: Handles file corruption gracefully
- ✅ **Scalable**: Easy to migrate to database later

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - User login
- `GET /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me/update` - Update user profile

### Admin
- `GET /api/admin/users` - View all users (for debugging)

## Demo Credentials

### Admin User
- **Email**: `admin@handycurv.com`
- **Password**: `admin123`
- **Role**: Admin

### Regular Users
- **Password**: `password123` (for any registered email)

## File Operations

### Reading Data
```javascript
const fileStorage = require('./utils/fileStorage');
const users = fileStorage.getUsers();
const user = fileStorage.getUserByEmail('admin@handycurv.com');
```

### Writing Data
```javascript
const newUser = fileStorage.addUser(userData);
const updatedUser = fileStorage.updateUser(id, updates);
fileStorage.updateLastLogin(id);
```

## Security Notes

### Current Implementation (Demo)
- Passwords are hardcoded for demo purposes
- No password hashing implemented
- No JWT token validation

### Production Recommendations
- Implement proper password hashing with bcrypt
- Add JWT token validation middleware
- Implement rate limiting
- Add input validation and sanitization

## Migration Path

### To Database (Future)
1. Replace file operations with database queries
2. Keep the same API structure
3. Add proper authentication middleware
4. Implement user sessions

### To Cloud Storage
1. Replace local file with cloud storage (AWS S3, etc.)
2. Add file encryption
3. Implement backup strategies

## Troubleshooting

### Common Issues
1. **File Permission Errors**: Ensure write permissions to `data/` directory
2. **Corrupted Data**: System automatically recreates default data
3. **Missing Users**: Check if data file exists and has proper structure

### Debug Endpoints
- `GET /api/admin/users` - View all users
- `GET /api/health` - Check server status

## File Locations
```
backend/
├── data/           # User data directory
│   └── users.json  # User data file
├── utils/
│   └── fileStorage.js  # Storage utility functions
├── routes/
│   └── auth.js     # Authentication routes
└── server.js       # Main server file
``` 