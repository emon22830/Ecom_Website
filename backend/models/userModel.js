const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password in queries
    },
    role: {
      type: String,
      enum: ['user', 'seller', 'admin'],
      default: 'user',
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: [true, 'Please add an institution'],
    },
    institutionEmail: {
      type: String,
      required: [true, 'Please add an institution email'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid institution email',
      ],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isInstitutionVerified: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false, // For sellers, requires admin approval
    },
    avatar: {
      type: String,
      default: 'default-avatar.jpg',
    },
    phone: {
      type: String,
      match: [
        /^(\+\d{1,3}[- ]?)?\d{10}$/,
        'Please add a valid phone number',
      ],
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    verificationDocuments: {
      studentId: String, // URL to S3 bucket
      selfieWithId: String, // URL to S3 bucket
      guardianLetter: String, // URL to S3 bucket (optional)
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    verificationRejectionReason: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    lastLogin: Date,
    googleId: String,
    facebookId: String,
    appleId: String,
    refreshToken: String,
    fcmTokens: [String], // Firebase Cloud Messaging tokens for push notifications
    preferences: {
      darkMode: {
        type: Boolean,
        default: false,
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
        sms: {
          type: Boolean,
          default: false,
        },
      },
      language: {
        type: String,
        default: 'en',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for user's full address
userSchema.virtual('fullAddress').get(function () {
  if (!this.address) return '';
  
  const { street, city, state, zipCode, country } = this.address;
  return `${street || ''}, ${city || ''}, ${state || ''} ${zipCode || ''}, ${country || ''}`;
});

// Virtual for user's products (seller only)
userSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'seller',
  justOne: false,
});

// Virtual for user's orders (as buyer)
userSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'buyer',
  justOne: false,
});

// Virtual for seller's received orders
userSchema.virtual('receivedOrders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'seller',
  justOne: false,
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Generate email verification token
userSchema.methods.getEmailVerificationToken = function () {
  // Generate token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to emailVerificationToken field
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Set expire
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

module.exports = mongoose.model('User', userSchema); 