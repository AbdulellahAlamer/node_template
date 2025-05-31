const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const protectRoute = require('../middleware/protectRoute');

// Public routes - no authentication required
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes - authentication required
router.get('/me', protectRoute, authController.getCurrentUser);

// Optional: Additional auth routes
router.post('/logout', protectRoute, (req, res) => {
  // Clear cookie if using cookies
  res.clearCookie('jwt');
  res.json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

// Optional: Refresh token endpoint
router.post('/refresh', protectRoute, (req, res) => {
  // In a real app, you might want to implement token refresh logic
  res.json({
    status: 'success',
    message: 'Token is still valid',
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;