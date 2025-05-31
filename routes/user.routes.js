
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const protectRoute = require('../middleware/protectRoute');

// All routes require authentication
router.use(protectRoute);

// User routes
router.get('/', userController.getAllUsers);           // GET /api/users - Get all users (admin only)
router.get('/:id', userController.getUserById);       // GET /api/users/:id - Get user by ID
router.put('/:id', userController.updateUser);        // PUT /api/users/:id - Update user
router.patch('/:id', userController.updateUser);      // PATCH /api/users/:id - Update user (alternative)
router.delete('/:id', userController.deleteUser);     // DELETE /api/users/:id - Delete user

module.exports = router;