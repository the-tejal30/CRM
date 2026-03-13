const express = require('express');
const router = express.Router();
const { register, login, getMe, updateMyProfile, forgotPassword, resetPassword, sendRegistrationOtp } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/send-registration-otp', sendRegistrationOtp);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateMyProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
