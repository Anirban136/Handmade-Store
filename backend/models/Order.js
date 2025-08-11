const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  image: {
    type: String,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [orderItemSchema],
  shippingAddress: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    }
  },
  paymentInfo: {
    id: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed', 'refunded']
    },
    method: {
      type: String,
      required: true,
      enum: ['cod', 'online', 'upi', 'card']
    }
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  deliveredAt: Date,
  cancelledAt: Date,
  returnRequestedAt: Date,
  returnReason: String,
  trackingNumber: String,
  estimatedDelivery: Date,
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  isGift: {
    type: Boolean,
    default: false
  },
  giftMessage: {
    type: String,
    maxlength: [200, 'Gift message cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

// Calculate total price before saving
orderSchema.pre('save', function(next) {
  this.itemsPrice = this.orderItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  // Calculate tax (18% GST for India)
  this.taxPrice = this.itemsPrice * 0.18;
  
  // Calculate shipping (free if order > ₹5000, else ₹200)
  this.shippingPrice = this.itemsPrice > 5000 ? 0 : 200;
  
  // Calculate total
  this.totalPrice = this.itemsPrice + this.taxPrice + this.shippingPrice;
  
  next();
});

// Get order summary
orderSchema.methods.getOrderSummary = function() {
  return {
    orderId: this._id,
    totalItems: this.orderItems.length,
    totalQuantity: this.orderItems.reduce((total, item) => total + item.quantity, 0),
    totalPrice: this.totalPrice,
    status: this.orderStatus,
    orderDate: this.createdAt
  };
};

// Check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  return ['pending', 'processing'].includes(this.orderStatus);
};

// Check if order can be returned
orderSchema.methods.canBeReturned = function() {
  const deliveredDate = this.deliveredAt || this.createdAt;
  const daysSinceDelivery = Math.floor((Date.now() - deliveredDate) / (1000 * 60 * 60 * 24));
  return this.orderStatus === 'delivered' && daysSinceDelivery <= 7;
};

module.exports = mongoose.model('Order', orderSchema); 