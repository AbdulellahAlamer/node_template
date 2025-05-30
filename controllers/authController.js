const authService = require('../services/authServices');

// User registration controller
const register = async (req, res, next) => {
  try {
    const { username, password, email } = req.body;
    
    // Validate request
    if (!username || !password || !email) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['username', 'password', 'email']
      });
    }
    
    // Register user
    const result = await authService.registerUser(username, password, email);
    
    // Return success
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result._id,
        username: result.username,
        email: result.email
      }
    });
  } catch (error) {
    // Check for duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Username or email already exists'
      });
    }
    
    next(error);
  }
};

// User login controller
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validate request
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['email', 'password']
      });
    }
    
    // Login user
    const result = await authService.loginUser(email, password);
    
    if (!result.success) {
      return res.status(401).json({
        error: result.message
      });
    }
    
    // Return token
    return res.json({
      token: result.token,
      user: {
        id: result.user._id,
        username: result.user.username,
        email: result.user.email,
        role: result.user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user information
const getCurrentUser = async (req, res, next) => {
  try {
    // req.user was set by auth middleware
    const user = await authService.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    // Return user info (exclude password)
    const { password, _id, ...userInfo } = user.toObject();
    return res.json({
      ...userInfo,
      id: _id
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser
};