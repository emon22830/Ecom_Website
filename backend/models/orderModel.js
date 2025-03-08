const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a buyer'],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a seller'],
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: [true, 'Please add an institution'],
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Please add a product'],
        },
        name: String,
        quantity: {
          type: Number,
          required: [true, 'Please add a quantity'],
          min: [1, 'Quantity must be at least 1'],
        },
        price: {
          type: Number,
          required: [true, 'Please add a price'],
        },
        customizations: [
          {
            name: String,
            option: String,
            priceModifier: Number,
          },
        ],
        image: String,
      },
    ],
    shippingAddress: {
      street: {
        type: String,
        required: [true, 'Please add a street address'],
      },
      city: {
        type: String,
        required: [true, 'Please add a city'],
      },
      state: {
        type: String,
        required: [true, 'Please add a state'],
      },
      zipCode: {
        type: String,
        required: [true, 'Please add a zip code'],
      },
      country: {
        type: String,
        required: [true, 'Please add a country'],
      },
      phone: {
        type: String,
        required: [true, 'Please add a phone number'],
      },
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'paypal', 'google_pay', 'apple_pay', 'crypto'],
      required: [true, 'Please add a payment method'],
    },
    paymentDetails: {
      transactionId: String,
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
      },
      paymentDate: Date,
      receiptUrl: String,
      cryptoAddress: String, // For crypto payments
      cryptoCurrency: String, // For crypto payments
    },
    subtotal: {
      type: Number,
      required: [true, 'Please add a subtotal'],
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: [true, 'Please add a total'],
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        },
        date: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],
    trackingNumber: String,
    trackingUrl: String,
    estimatedDeliveryDate: Date,
    actualDeliveryDate: Date,
    notes: String,
    isReviewed: {
      type: Boolean,
      default: false,
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
    cancellationReason: String,
    refundStatus: {
      type: String,
      enum: ['none', 'requested', 'processing', 'completed', 'rejected'],
      default: 'none',
    },
    refundReason: String,
    refundAmount: Number,
    refundDate: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for order's reviews
orderSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'order',
  justOne: false,
});

// Update product quantity and sold count after order is placed
orderSchema.post('save', async function () {
  // Only update if order is not cancelled
  if (this.orderStatus !== 'cancelled') {
    const Product = this.model('Product');
    
    // Update each product in the order
    for (const item of this.products) {
      const product = await Product.findById(item.product);
      
      if (product) {
        // Decrease quantity and increase sold count
        product.quantity = Math.max(0, product.quantity - item.quantity);
        product.sold += item.quantity;
        
        // If quantity is 0, set isAvailable to false
        if (product.quantity === 0) {
          product.isAvailable = false;
        }
        
        await product.save();
      }
    }
  }
});

// Generate order number
orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    // Generate a unique order number: ORD-YYYYMMDD-XXXX (where XXXX is a random number)
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    
    this.orderNumber = `ORD-${year}${month}${day}-${random}`;
  }
  
  // Add initial status to status history if it's a new order
  if (this.isNew) {
    this.statusHistory.push({
      status: this.orderStatus,
      date: Date.now(),
      note: 'Order placed',
    });
  }
  
  next();
});

module.exports = mongoose.model('Order', orderSchema); 