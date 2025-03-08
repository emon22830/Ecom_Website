const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const Institution = require('../models/institutionModel');
const { logger } = require('../utils/logger');
const sendEmail = require('../utils/sendEmail');

/**
 * Generate JWT token
 * @param {string} id - User ID
 * @returns {string} - JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Create and send token with cookie
 * @param {Object} user - User object
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 */
const createSendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);
  
  // Set cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };
  
  // Set cookie
  res.cookie('token', token, cookieOptions);
  
  // Remove password from output
  user.password = undefined;
  
  res.status(statusCode).json({
    success: true,
    token,
    data: {
      user,
    },
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      institutionId,
      institutionEmail,
      phone,
    } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }
    
    // Check if institution exists
    const institution = await Institution.findById(institutionId);
    
    if (!institution) {
      return res.status(400).json({
        success: false,
        message: 'Institution not found',
      });
    }
    
    // Validate institution email domain
    if (institution.emailDomains && institution.emailDomains.length > 0) {
      const emailDomain = institutionEmail.split('@')[1];
      
      if (!institution.emailDomains.includes(emailDomain)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid institution email domain',
        });
      }
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      institution: institutionId,
      institutionEmail,
      phone,
      role: 'user',
    });
    
    // Generate email verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    
    // Create verification URL
    const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    // Send email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Email Verification',
        message: `Please verify your email by clicking on the following link: ${verificationURL}`,
      });
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please verify your email.',
      });
    } catch (error) {
      user.emailVerificationToken = undefined;
      user.emailVerificationExpire = undefined;
      await user.save({ validateBeforeSave: false });
      
      logger.error(`Error sending verification email: ${error.message}`);
      
      return res.status(500).json({
        success: false,
        message: 'Error sending verification email',
      });
    }
  } catch (error) {
    logger.error(`Error registering user: ${error.message}`);
    
    res.status(500).json({
      success: false,
      message: 'Error registering user',
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }
    
    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
    
    // Check if password is correct
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
    
    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in',
      });
    }
    
    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });
    
    // Send token
    createSendToken(user, 200, res);
  } catch (error) {
    logger.error(`Error logging in: ${error.message}`);
    
    res.status(500).json({
      success: false,
      message: 'Error logging in',
    });
  }
};

/**
 * @desc    Logout user / clear cookie
 * @route   GET /api/auth/logout
 * @access  Private
 */
exports.logout = (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error(`Error getting user profile: ${error.message}`);
    
    res.status(500).json({
      success: false,
      message: 'Error getting user profile',
    });
  }
};

/**
 * @desc    Update user details
 * @route   PUT /api/auth/updatedetails
 * @access  Private
 */
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
    };
    
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error(`Error updating user details: ${error.message}`);
    
    res.status(500).json({
      success: false,
      message: 'Error updating user details',
    });
  }
};

/**
 * @desc    Update password
 * @route   PUT /api/auth/updatepassword
 * @access  Private
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Check if passwords are provided
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
    }
    
    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    
    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    // Send token
    createSendToken(user, 200, res);
  } catch (error) {
    logger.error(`Error updating password: ${error.message}`);
    
    res.status(500).json({
      success: false,
      message: 'Error updating password',
    });
  }
};

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgotpassword
 * @access  Public
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Check if email is provided
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email',
      });
    }
    
    // Get user
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email',
      });
    }
    
    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    
    // Create reset URL
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    // Send email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset',
        message: `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetURL}`,
      });
      
      res.status(200).json({
        success: true,
        message: 'Email sent',
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      
      logger.error(`Error sending reset email: ${error.message}`);
      
      return res.status(500).json({
        success: false,
        message: 'Error sending reset email',
      });
    }
  } catch (error) {
    logger.error(`Error in forgot password: ${error.message}`);
    
    res.status(500).json({
      success: false,
      message: 'Error in forgot password',
    });
  }
};

/**
 * @desc    Reset password
 * @route   PUT /api/auth/resetpassword/:resettoken
 * @access  Public
 */
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');
    
    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
    
    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    
    // Send token
    createSendToken(user, 200, res);
  } catch (error) {
    logger.error(`Error resetting password: ${error.message}`);
    
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
    });
  }
};

/**
 * @desc    Verify email
 * @route   GET /api/auth/verifyemail/:verificationtoken
 * @access  Public
 */
exports.verifyEmail = async (req, res, next) => {
  try {
    // Get hashed token
    const emailVerificationToken = crypto
      .createHash('sha256')
      .update(req.params.verificationtoken)
      .digest('hex');
    
    // Find user with valid token
    const user = await User.findOne({
      emailVerificationToken,
      emailVerificationExpire: { $gt: Date.now() },
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
    
    // Set email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    logger.error(`Error verifying email: ${error.message}`);
    
    res.status(500).json({
      success: false,
      message: 'Error verifying email',
    });
  }
};

/**
 * @desc    Google OAuth login/register
 * @route   POST /api/auth/google
 * @access  Public
 */
exports.googleAuth = async (req, res, next) => {
  try {
    const { idToken, institutionId } = req.body;
    
    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    
    // Check if user exists
    let user = await User.findOne({ email });
    
    if (user) {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save({ validateBeforeSave: false });
      }
    } else {
      // Check if institution exists
      const institution = await Institution.findById(institutionId);
      
      if (!institution) {
        return res.status(400).json({
          success: false,
          message: 'Institution not found',
        });
      }
      
      // Create new user
      user = await User.create({
        name,
        email,
        password: crypto.randomBytes(20).toString('hex'),
        googleId,
        avatar: picture,
        institution: institutionId,
        institutionEmail: email,
        isEmailVerified: true, // Google OAuth already verifies email
      });
    }
    
    // Send token
    createSendToken(user, 200, res);
  } catch (error) {
    logger.error(`Error in Google OAuth: ${error.message}`);
    
    res.status(500).json({
      success: false,
      message: 'Error in Google OAuth',
    });
  }
};

/**
 * @desc    Apply for seller verification
 * @route   POST /api/auth/apply-seller
 * @access  Private
 */
exports.applyForSellerVerification = async (req, res, next) => {
  try {
    const { studentIdUrl, selfieWithIdUrl, guardianLetterUrl } = req.body;
    
    // Check if required documents are provided
    if (!studentIdUrl || !selfieWithIdUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide student ID and selfie with ID',
      });
    }
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        verificationDocuments: {
          studentId: studentIdUrl,
          selfieWithId: selfieWithIdUrl,
          guardianLetter: guardianLetterUrl,
        },
        verificationStatus: 'pending',
      },
      {
        new: true,
        runValidators: true,
      }
    );
    
    res.status(200).json({
      success: true,
      data: user,
      message: 'Seller verification application submitted successfully',
    });
  } catch (error) {
    logger.error(`Error applying for seller verification: ${error.message}`);
    
    res.status(500).json({
      success: false,
      message: 'Error applying for seller verification',
    });
  }
};

/**
 * @desc    Update user preferences
 * @route   PUT /api/auth/preferences
 * @access  Private
 */
exports.updatePreferences = async (req, res, next) => {
  try {
    const { darkMode, notifications, language } = req.body;
    
    const preferences = {};
    
    if (darkMode !== undefined) {
      preferences['preferences.darkMode'] = darkMode;
    }
    
    if (notifications) {
      if (notifications.email !== undefined) {
        preferences['preferences.notifications.email'] = notifications.email;
      }
      
      if (notifications.push !== undefined) {
        preferences['preferences.notifications.push'] = notifications.push;
      }
      
      if (notifications.sms !== undefined) {
        preferences['preferences.notifications.sms'] = notifications.sms;
      }
    }
    
    if (language) {
      preferences['preferences.language'] = language;
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      preferences,
      {
        new: true,
        runValidators: true,
      }
    );
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error(`Error updating preferences: ${error.message}`);
    
    res.status(500).json({
      success: false,
      message: 'Error updating preferences',
    });
  }
};

/**
 * @desc    Update FCM token for push notifications
 * @route   PUT /api/auth/fcm-token
 * @access  Private
 */
exports.updateFcmToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    
    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'Please provide FCM token',
      });
    }
    
    // Get user
    const user = await User.findById(req.user.id);
    
    // Add FCM token if not already exists
    if (!user.fcmTokens.includes(fcmToken)) {
      user.fcmTokens.push(fcmToken);
      await user.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'FCM token updated successfully',
    });
  } catch (error) {
    logger.error(`Error updating FCM token: ${error.message}`);
    
    res.status(500).json({
      success: false,
      message: 'Error updating FCM token',
    });
  }
}; 