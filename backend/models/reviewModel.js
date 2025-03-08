const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a user'],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Please add a product'],
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Please add an order'],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a seller'],
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Please add a comment'],
      trim: true,
      maxlength: [500, 'Comment cannot be more than 500 characters'],
    },
    images: [String], // URLs to S3 bucket
    pros: [String],
    cons: [String],
    isVerifiedPurchase: {
      type: Boolean,
      default: true, // Since it's linked to an order
    },
    isHelpful: {
      count: {
        type: Number,
        default: 0,
      },
      users: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },
    isReported: {
      type: Boolean,
      default: false,
    },
    reportReason: String,
    sellerResponse: {
      comment: String,
      date: Date,
    },
    isApproved: {
      type: Boolean,
      default: true, // Auto-approve reviews, but can be flagged for review
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent user from submitting more than one review per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to calculate average rating for a product
reviewSchema.statics.calcAverageRating = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await this.model('Product').findByIdAndUpdate(productId, {
      averageRating: stats[0].avgRating,
      numberOfRatings: stats[0].numReviews,
    });
  } else {
    await this.model('Product').findByIdAndUpdate(productId, {
      averageRating: 0,
      numberOfRatings: 0,
    });
  }
};

// Call calcAverageRating after save
reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.product);
});

// Call calcAverageRating before remove
reviewSchema.pre('remove', function () {
  this.constructor.calcAverageRating(this.product);
});

// Mark order as reviewed
reviewSchema.post('save', async function () {
  await this.model('Order').findByIdAndUpdate(this.order, {
    isReviewed: true,
  });
});

module.exports = mongoose.model('Review', reviewSchema); 