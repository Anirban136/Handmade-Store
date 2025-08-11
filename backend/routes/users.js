const express = require('express');
const router = express.Router();
const User = require('../models/User');
const asyncError = require('../middleware/asyncError');
const ErrorHandler = require('../utils/errorHandler');
const { protect, authorizeRoles } = require('../middleware/auth');

// Get all users - ADMIN => /api/users/admin/all
router.get('/admin/all', protect, authorizeRoles('admin'), asyncError(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users
  });
}));

// Get user details - ADMIN => /api/users/admin/:id
router.get('/admin/:id', protect, authorizeRoles('admin'), asyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  res.status(200).json({
    success: true,
    user
  });
}));

// Update user role - ADMIN => /api/users/admin/:id
router.put('/admin/:id', protect, authorizeRoles('admin'), asyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  });

  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  res.status(200).json({
    success: true,
    user
  });
}));

// Delete user - ADMIN => /api/users/admin/:id
router.delete('/admin/:id', protect, authorizeRoles('admin'), asyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
}));

// Get user profile => /api/users/profile
router.get('/profile', protect, asyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user
  });
}));

// Update user profile => /api/users/profile/update
router.put('/profile/update', protect, asyncError(async (req, res, next) => {
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

// Get user statistics - ADMIN => /api/users/admin/stats
router.get('/admin/stats', protect, authorizeRoles('admin'), asyncError(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const adminUsers = await User.countDocuments({ role: 'admin' });
  const regularUsers = await User.countDocuments({ role: 'user' });

  // Get users registered in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newUsers = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      adminUsers,
      regularUsers,
      newUsers
    }
  });
}));

module.exports = router; 