const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  googleAuth,
  applyForSellerVerification,
  updatePreferences,
  updateFcmToken,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/verifyemail/:verificationtoken', verifyEmail);
router.post('/google', googleAuth);

// Protected routes
router.use(protect); // All routes below this middleware are protected
router.get('/me', getMe);
router.put('/updatedetails', updateDetails);
router.put('/updatepassword', updatePassword);
router.post('/apply-seller', applyForSellerVerification);
router.put('/preferences', updatePreferences);
router.put('/fcm-token', updateFcmToken);

module.exports = router; 