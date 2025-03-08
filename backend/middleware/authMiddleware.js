const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');
const User = require('../models/userModel');

/**
 * Protect routes - Verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      // Get token from cookie
      token = req.cookies.token;
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found',
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
    });
  }
};

/**
 * Admin middleware - Check if user is admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as an admin',
    });
  }
};

/**
 * Seller middleware - Check if user is a verified seller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const verifiedSeller = (req, res, next) => {
  if (req.user && req.user.role === 'seller' && req.user.isVerified) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as a verified seller',
    });
  }
};

/**
 * Institution middleware - Check if user belongs to a specific institution
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const sameInstitution = (req, res, next) => {
  // Get institution ID from request params or body
  const institutionId = req.params.institutionId || req.body.institutionId;

  if (req.user && req.user.institution.toString() === institutionId) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized to access resources from this institution',
    });
  }
};

module.exports = { protect, admin, verifiedSeller, sameInstitution }; 