const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncError = require('../middleware/asyncError');
const ErrorHandler = require('../utils/errorHandler');
const { protect, authorizeRoles } = require('../middleware/auth');

// Create new order => /api/orders/new
router.post('/new', protect, asyncError(async (req, res, next) => {
  const {
    orderItems,
    shippingAddress,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    notes,
    isGift,
    giftMessage
  } = req.body;

  const order = await Order.create({
    orderItems,
    shippingAddress,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    notes,
    isGift,
    giftMessage,
    user: req.user._id
  });

  res.status(201).json({
    success: true,
    order
  });
}));

// Get single order => /api/orders/:id
router.get('/:id', protect, asyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  res.status(200).json({
    success: true,
    order
  });
}));

// Get logged in user orders => /api/orders/me
router.get('/me', protect, asyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders
  });
}));

// Get all orders - ADMIN => /api/orders/admin/all
router.get('/admin/all', protect, authorizeRoles('admin'), asyncError(async (req, res, next) => {
  const orders = await Order.find().populate('user', 'name email');

  let totalAmount = 0;
  orders.forEach(order => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders
  });
}));

// Update / Process order - ADMIN => /api/orders/admin/:id
router.put('/admin/:id', protect, authorizeRoles('admin'), asyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  if (order.orderStatus === 'delivered') {
    return next(new ErrorHandler('You have already delivered this order', 400));
  }

  if (req.body.orderStatus === 'shipped') {
    order.orderItems.forEach(async item => {
      await updateStock(item.product, item.quantity);
    });
  }

  order.orderStatus = req.body.orderStatus;

  if (req.body.orderStatus === 'delivered') {
    order.deliveredAt = Date.now();
  }

  if (req.body.orderStatus === 'cancelled') {
    order.cancelledAt = Date.now();
  }

  if (req.body.trackingNumber) {
    order.trackingNumber = req.body.trackingNumber;
  }

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    order
  });
}));

// Delete order => /api/orders/:id
router.delete('/:id', protect, asyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  // Only allow deletion if order is pending or cancelled
  if (!['pending', 'cancelled'].includes(order.orderStatus)) {
    return next(new ErrorHandler('Cannot delete order that is not pending or cancelled', 400));
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Order deleted successfully'
  });
}));

// Cancel order => /api/orders/:id/cancel
router.put('/:id/cancel', protect, asyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  if (!order.canBeCancelled()) {
    return next(new ErrorHandler('Order cannot be cancelled at this stage', 400));
  }

  order.orderStatus = 'cancelled';
  order.cancelledAt = Date.now();

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    order
  });
}));

// Request return => /api/orders/:id/return
router.put('/:id/return', protect, asyncError(async (req, res, next) => {
  const { returnReason } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  if (!order.canBeReturned()) {
    return next(new ErrorHandler('Order cannot be returned. Return window has expired.', 400));
  }

  order.orderStatus = 'returned';
  order.returnRequestedAt = Date.now();
  order.returnReason = returnReason;

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Return request submitted successfully',
    order
  });
}));

// Update stock function
async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  product.stock = product.stock - quantity;
  await product.save({ validateBeforeSave: false });
}

module.exports = router; 