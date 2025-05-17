// routes/userRoutes.js
const express = require('express');
const {
  getAllUsers,
  getMe,
  updateMe,
  adminUpdateUser,
  adminDeleteUser
} = require('../controllers/userController');

const { protectRoute } = require('../middleware/protectRoute');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

// Login for user
router.get('/me', protectRoute, getMe);
router.patch('/me', protectRoute, updateMe);

// Username update endpoint
router.patch('/username', protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        status: 'error',
        message: 'Username is required'
      });
    }

    // Check if username is already taken
    const existingUser = await User.findOne({ username, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Username is already taken'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { username },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    console.error('Error updating username:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Only for Admin
router.get('/', protectRoute, isAdmin, getAllUsers);
router.patch('/:id', protectRoute, isAdmin, adminUpdateUser);
router.delete('/:id', protectRoute, isAdmin, adminDeleteUser);

module.exports = router;