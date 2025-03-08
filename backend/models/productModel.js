const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price must be at least 0'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price must be at least 0'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: [
        'electronics',
        'books',
        'clothing',
        'furniture',
        'food',
        'services',
        'other',
      ],
    },
    subcategory: String,
    tags: [String],
    images: {
      type: [String],
      required: [true, 'Please add at least one image'],
      validate: {
        validator: function (array) {
          return array.length > 0;
        },
        message: 'Please add at least one image',
      },
    },
    thumbnailImage: String, // Main image for product listing
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
    quantity: {
      type: Number,
      required: [true, 'Please add a quantity'],
      min: [0, 'Quantity must be at least 0'],
      default: 1,
    },
    sold: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: false, // Requires admin approval
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: String,
    condition: {
      type: String,
      enum: ['new', 'like_new', 'good', 'fair', 'poor'],
      required: [true, 'Please add a condition'],
    },
    customizationOptions: [
      {
        name: String, // e.g., "Size", "Color"
        options: [String], // e.g., ["S", "M", "L"] or ["Red", "Blue"]
        priceModifiers: [Number], // Price adjustments for each option
      },
    ],
    specifications: {
      type: Map,
      of: String,
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
      default: 0,
    },
    numberOfRatings: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    shippingInfo: {
      weight: Number, // in kg
      dimensions: {
        length: Number, // in cm
        width: Number, // in cm
        height: Number, // in cm
      },
      shippingFee: Number,
      freeShipping: {
        type: Boolean,
        default: false,
      },
      estimatedDelivery: String, // e.g., "2-3 business days"
    },
    returnPolicy: {
      returnsAccepted: {
        type: Boolean,
        default: false,
      },
      returnPeriod: Number, // in days
      returnConditions: String,
    },
    warranty: {
      hasWarranty: {
        type: Boolean,
        default: false,
      },
      warrantyPeriod: String, // e.g., "1 year"
      warrantyDetails: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create product slug from the name
productSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  
  // Set thumbnail image to first image if not provided
  if (!this.thumbnailImage && this.images.length > 0) {
    this.thumbnailImage = this.images[0];
  }
  
  next();
});

// Virtual for product's reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
  justOne: false,
});

// Static method to get average rating
productSchema.statics.getAverageRating = async function (productId) {
  const obj = await this.model('Review').aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numberOfRatings: { $sum: 1 },
      },
    },
  ]);

  try {
    if (obj[0]) {
      await this.findByIdAndUpdate(productId, {
        averageRating: obj[0].averageRating.toFixed(1),
        numberOfRatings: obj[0].numberOfRatings,
      });
    } else {
      await this.findByIdAndUpdate(productId, {
        averageRating: 0,
        numberOfRatings: 0,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
productSchema.post('save', function () {
  this.constructor.getAverageRating(this._id);
});

// Call getAverageRating after remove
productSchema.post('remove', function () {
  this.constructor.getAverageRating(this._id);
});

// Increment view count
productSchema.methods.incrementViews = async function () {
  this.views += 1;
  await this.save();
};

module.exports = mongoose.model('Product', productSchema); 