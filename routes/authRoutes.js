const express = require('express');
const { 
  registerUser, 
  verifyOTP, 
  loginUser, 
  getMe, 
  forgotPassword, 
  resetPassword,
  resendOTP,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-otp', resendOTP);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;