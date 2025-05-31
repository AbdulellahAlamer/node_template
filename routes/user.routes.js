const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { auth } = require('../middleware/protectRoute');

// All routes require authentication
router.use(auth.fn);

// User routes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;