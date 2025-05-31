const authService = require('../services/auth.service');

// User registration controller
const register = async (req, res, next) => {
  try {
    const { username, password, email } = req.body;
    
    // Validate request
    if (!username || !password || !email) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields',
        errors: {
          required: ['username', 'password', 'email']
        }
      });
    }

    // Basic validation
    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters long'
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        status: 'error',
        message: 'Username must be at least 3 characters long'
      });
    }

    // Email format validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please enter a valid email address'
      });
    }
    
    // Register user
    const result = await authService.registerUser(username, password, email);
    
    // Return success
    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          id: result._id,
          username: result.username,
          email: result.email,
          role: result.role,
          status: result.status,
          createdAt: result.createdAt
        }
      }
    });
  } catch (error) {
    // Check for duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        status: 'error',
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      });
    }

    // Check for validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors
      });
    }

    // Handle custom error messages
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        status: 'error',
        message: error.message
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
        status: 'error',
        message: 'Missing required fields',
        errors: {
          required: ['email', 'password']
        }
      });
    }
    
    // Login user
    const result = await authService.loginUser(email, password);
    
    if (!result.success) {
      return res.status(401).json({
        status: 'error',
        message: result.message
      });
    }
    
    // Set cookie if in development (optional)
    if (process.env.NODE_ENV === 'development') {
      res.cookie('jwt', result.token, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
    }
    
    // Return token and user info
    return res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        token: result.token,
        user: {
          id: result.user._id,
          username: result.user.username,
          email: result.user.email,
          role: result.user.role,
          status: result.user.status,
          lastLogin: result.user.lastLogin
        }
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
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Return user info (password already excluded by model)
    return res.json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          status: user.status,
          profile: user.profile,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Change password controller
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Validate request
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields',
        errors: {
          required: ['currentPassword', 'newPassword', 'confirmPassword']
        }
      });
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'New passwords do not match'
      });
    }

    // Check password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'New password must be at least 6 characters long'
      });
    }

    // Change password
    const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
    
    if (!result.success) {
      return res.status(400).json({
        status: 'error',
        message: result.message
      });
    }

    return res.json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  changePassword
};