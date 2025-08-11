const express = require('express');
const router = express.Router();
const User = require('../models/User');
const sendToken = require('../utils/sendToken');
const asyncError = require('../middleware/asyncError');
const ErrorHandler = require('../utils/errorHandler');

// Register user => /api/auth/register
router.post('/register', asyncError(async (req, res, next) => {
  const { name, email, password, phone, address } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorHandler('User already exists', 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
    address
  });

  sendToken(user, 201, res);
}));

// Login user => /api/auth/login
router.post('/login', asyncError(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password is entered by user
  if (!email || !password) {
    return next(new ErrorHandler('Please enter email & password', 400));
  }

  // Finding user in database
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorHandler('Invalid Email or Password', 401));
  }

  // Check if password is correct or not
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler('Invalid Email or Password', 401));
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save();

  sendToken(user, 200, res);
}));

// Logout user => /api/auth/logout
router.get('/logout', asyncError(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
}));

// Get currently logged in user details => /api/auth/me
router.get('/me', asyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user
  });
}));

// Update user profile => /api/auth/me/update
router.put('/me/update', asyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address
  };

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  });

  res.status(200).json({
    success: true,
    user
  });
}));

// Update user password => /api/auth/password/update
router.put('/password/update', asyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check previous user password
  const isMatched = await user.comparePassword(req.body.oldPassword);
  if (!isMatched) {
    return next(new ErrorHandler('Old password is incorrect', 400));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res);
}));

module.exports = router; 