const userService = require('../services/userService');

// Get all users (admin only)
const getAllUsers = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden: Requires admin access'
      });
    }
    
    const users = await userService.getAllUsers();
    
    // Return sanitized user list (no passwords)
    const sanitizedUsers = users.map(user => {
      const { password, ...userInfo } = user;
      return userInfo;
    });
    
    return res.json(sanitizedUsers);
  } catch (error) {
    next(error);
  }
};


// Get user by ID
const getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Users can only access their own profile unless they're an admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden: You can only access your own profile'
      });
    }
    
    const user = await userService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    // Return sanitized user (no password)
    const { password, ...userInfo } = user;
    return res.json(userInfo);
  } catch (error) {
    next(error);
  }
};

// Update user 
const updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Users can only update their own profile unless they're an admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden: You can only update your own profile'
      });
    }
    
    // Don't allow updating username through this endpoint
    const { username, password, ...updateData } = req.body;
    
    const updatedUser = await userService.updateUser(userId, updateData);
    
    if (!updatedUser) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    // Return sanitized user (no password)
    const { password: pass, ...userInfo } = updatedUser;
    return res.json(userInfo);
  } catch (error) {
    next(error);
  }
};

// Delete user
const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Users can only delete their own profile unless they're an admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden: You can only delete your own profile'
      });
    }
    
    const result = await userService.deleteUser(userId);
    
    if (!result) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    return res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};