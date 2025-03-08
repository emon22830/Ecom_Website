const mongoose = require('mongoose');
const slugify = require('slugify');

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add an institution name'],
      unique: true,
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please use a valid URL with HTTP or HTTPS',
      ],
    },
    phone: {
      type: String,
      match: [
        /^(\+\d{1,3}[- ]?)?\d{10}$/,
        'Please add a valid phone number',
      ],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    location: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
      formattedAddress: String,
    },
    logo: {
      type: String,
      default: 'default-institution-logo.jpg',
    },
    coverImage: {
      type: String,
      default: 'default-institution-cover.jpg',
    },
    emailDomains: [String], // Allowed email domains for this institution
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationDocuments: {
      registrationCertificate: String, // URL to S3 bucket
      taxId: String, // URL to S3 bucket
      otherDocuments: [String], // URLs to S3 bucket
    },
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
    },
    type: {
      type: String,
      enum: [
        'university',
        'college',
        'high_school',
        'middle_school',
        'elementary_school',
        'other',
      ],
      default: 'university',
    },
    foundedYear: Number,
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    numberOfRatings: {
      type: Number,
      default: 0,
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create institution slug from the name
institutionSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Virtual for institution's users
institutionSchema.virtual('users', {
  ref: 'User',
  localField: '_id',
  foreignField: 'institution',
  justOne: false,
});

// Virtual for institution's products
institutionSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'institution',
  justOne: false,
});

// Virtual for institution's full address
institutionSchema.virtual('fullAddress').get(function () {
  if (!this.address) return '';
  
  const { street, city, state, zipCode, country } = this.address;
  return `${street || ''}, ${city || ''}, ${state || ''} ${zipCode || ''}, ${country || ''}`;
});

// Static method to get average rating
institutionSchema.statics.getAverageRating = async function (institutionId) {
  const obj = await this.aggregate([
    {
      $match: { institution: institutionId },
    },
    {
      $group: {
        _id: '$institution',
        averageRating: { $avg: '$rating' },
        numberOfRatings: { $sum: 1 },
      },
    },
  ]);

  try {
    if (obj[0]) {
      await this.findByIdAndUpdate(institutionId, {
        averageRating: obj[0].averageRating.toFixed(1),
        numberOfRatings: obj[0].numberOfRatings,
      });
    } else {
      await this.findByIdAndUpdate(institutionId, {
        averageRating: 0,
        numberOfRatings: 0,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports = mongoose.model('Institution', institutionSchema); 