const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a user'],
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Please add a product'],
        },
        quantity: {
          type: Number,
          required: [true, 'Please add a quantity'],
          min: [1, 'Quantity must be at least 1'],
          default: 1,
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
      },
    ],
    totalItems: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    appliedCoupon: {
      code: String,
      discount: Number,
      discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total items and price before saving
cartSchema.pre('save', function (next) {
  // Calculate total items
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  
  // Calculate total price
  this.totalPrice = this.items.reduce((total, item) => {
    // Base price
    let itemPrice = item.price * item.quantity;
    
    // Add customization price modifiers
    if (item.customizations && item.customizations.length > 0) {
      const customizationTotal = item.customizations.reduce(
        (sum, customization) => sum + (customization.priceModifier || 0),
        0
      );
      itemPrice += customizationTotal * item.quantity;
    }
    
    return total + itemPrice;
  }, 0);
  
  // Apply coupon if exists
  if (this.appliedCoupon) {
    if (this.appliedCoupon.discountType === 'percentage') {
      const discountAmount = (this.totalPrice * this.appliedCoupon.discount) / 100;
      this.totalPrice -= discountAmount;
    } else if (this.appliedCoupon.discountType === 'fixed') {
      this.totalPrice = Math.max(0, this.totalPrice - this.appliedCoupon.discount);
    }
  }
  
  next();
});

// Add item to cart
cartSchema.methods.addItem = async function (productId, quantity = 1, customizations = []) {
  // Find product
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  // Check if product is available
  if (!product.isAvailable || product.quantity < quantity) {
    throw new Error('Product is not available in the requested quantity');
  }
  
  // Check if product is already in cart
  const existingItemIndex = this.items.findIndex(
    (item) => item.product.toString() === productId.toString()
  );
  
  if (existingItemIndex !== -1) {
    // Update existing item
    this.items[existingItemIndex].quantity += quantity;
    
    // Update customizations if provided
    if (customizations.length > 0) {
      this.items[existingItemIndex].customizations = customizations;
    }
  } else {
    // Add new item
    this.items.push({
      product: productId,
      quantity,
      price: product.discountPrice || product.price,
      customizations,
    });
  }
  
  await this.save();
  return this;
};

// Remove item from cart
cartSchema.methods.removeItem = async function (productId) {
  this.items = this.items.filter(
    (item) => item.product.toString() !== productId.toString()
  );
  
  await this.save();
  return this;
};

// Update item quantity
cartSchema.methods.updateItemQuantity = async function (productId, quantity) {
  const itemIndex = this.items.findIndex(
    (item) => item.product.toString() === productId.toString()
  );
  
  if (itemIndex !== -1) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      return this.removeItem(productId);
    }
    
    // Update quantity
    this.items[itemIndex].quantity = quantity;
    await this.save();
  }
  
  return this;
};

// Clear cart
cartSchema.methods.clearCart = async function () {
  this.items = [];
  this.appliedCoupon = undefined;
  await this.save();
  return this;
};

// Apply coupon
cartSchema.methods.applyCoupon = async function (couponCode, discount, discountType) {
  this.appliedCoupon = {
    code: couponCode,
    discount,
    discountType,
  };
  
  await this.save();
  return this;
};

// Remove coupon
cartSchema.methods.removeCoupon = async function () {
  this.appliedCoupon = undefined;
  await this.save();
  return this;
};

module.exports = mongoose.model('Cart', cartSchema); 