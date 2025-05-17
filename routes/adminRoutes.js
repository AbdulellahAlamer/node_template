const express = require('express');
const router = express.Router();
const { protectRoute } = require('../middleware/protectRoute');
const { adminAuth, requirePermission } = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');

// Apply protectRoute middleware first to ensure authentication
router.use(protectRoute);

// Then apply admin auth middleware to ensure admin role
router.use(adminAuth);

// Get all users (requires manageUsers permission)
router.get('/users', requirePermission('manageUsers'), adminController.getAllUsers);

// Get user statistics (requires viewAnalytics permission)
router.get('/stats', requirePermission('viewAnalytics'), adminController.getUserStats);

// Update user role (requires manageUsers permission)
router.put('/users/:userId/role', requirePermission('manageUsers'), adminController.updateUserRole);

// Update admin permissions (requires manageUsers permission)
router.put('/users/:userId/permissions', requirePermission('manageUsers'), adminController.updateAdminPermissions);

// Delete user (requires manageUsers permission)
router.delete('/users/:userId', requirePermission('manageUsers'), adminController.deleteUser);

module.exports = router; 