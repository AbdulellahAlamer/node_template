const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { auth } = require('../middleware/protectRoute');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', auth.fn, authController.getCurrentUser);

module.exports = router;