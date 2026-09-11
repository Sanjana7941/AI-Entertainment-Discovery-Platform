const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  forgotPassword,
  checkIdentifier,
  verifyStepCredentials,
  verify2FA
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/check-identifier', checkIdentifier);
router.post('/verify-step-credentials', verifyStepCredentials);
router.post('/verify-2fa', verify2FA);
router.post('/logout', (req, res) => res.json({ success: true, message: 'Logged out successfully.' }));
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);

module.exports = router;
