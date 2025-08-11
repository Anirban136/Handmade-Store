const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const fileStorage = require('../utils/fileStorage');

// Register user => /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Check if user already exists
    const existingUser = fileStorage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const newUser = fileStorage.addUser({
      name,
      email,
      password: '$2a$10$example_hash', // In real app, hash the password
      role: 'user',
      phone: phone || '',
      address: address || {}
    });

    if (!newUser) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }

    // Generate a simple token (in real app, use JWT)
    const token = `token_${newUser.id}_${Date.now()}`;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token: token,
      user: { 
        id: newUser.id, 
        name: newUser.name, 
        email: newUser.email, 
        role: newUser.role 
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Login user => /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password is entered by user
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter email & password'
      });
    }

    // Finding user in database
    const user = fileStorage.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Email or Password'
      });
    }

    // Check if password is correct or not
    // For demo purposes, use simple password check
    // In real app, use bcrypt.compare(password, user.password)
    let isPasswordMatched = false;
    
    if (user.email === 'admin@handycurv.com' && password === 'admin123') {
      // Admin user with demo password
      isPasswordMatched = true;
    } else if (password === 'password123') {
      // Regular users with demo password
      isPasswordMatched = true;
    }

    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Email or Password'
      });
    }

    // Update last login
    fileStorage.updateLastLogin(user.id);

    // Generate a simple token (in real app, use JWT)
    const token = `token_${user.id}_${Date.now()}`;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Logout user => /api/auth/logout
router.get('/logout', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Get currently logged in user details => /api/auth/me
router.get('/me', (req, res) => {
  // For demo purposes, return admin user
  // In real app, verify token and return actual user
  const user = fileStorage.getUserById('1'); // Admin user
  
  if (user) {
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
});

// Update user profile => /api/auth/me/update
router.put('/me/update', (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    
    // For demo purposes, update admin user
    // In real app, verify token and update actual user
    const updatedUser = fileStorage.updateUser('1', {
      name: name || undefined,
      email: email || undefined,
      phone: phone || undefined,
      address: address || undefined
    });

    if (updatedUser) {
      res.status(200).json({
        success: true,
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
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user password => /api/auth/password/update
router.put('/password/update', (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    // For demo purposes, check admin password
    // In real app, verify token and check actual user password
    if (oldPassword !== 'admin123') {
      return res.status(400).json({
        success: false,
        message: 'Old password is incorrect'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin: Get all users (for admin panel)
router.get('/admin/users', (req, res) => {
  try {
    const users = fileStorage.getUsers().map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router; 