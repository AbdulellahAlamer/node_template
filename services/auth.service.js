const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const { generateToken } = require('../utils/jwt');

// Register new user
const registerUser = async (username, password, email) => {
  try {
    // Check if user already exists
    const existingUserByEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingUserByEmail) {
      throw new Error('User with this email already exists');
    }

    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      throw new Error('User with this username already exists');
    }

    // Create new user (password will be hashed by the pre-save middleware)
    const newUser = await User.create({
      username: username.trim(),
      password,
      email: email.toLowerCase().trim()
    });
    
    return newUser;
  } catch (error) {
    console.error('Error registering user:', error.message);
    throw error;
  }
};

// Authenticate user login
const loginUser = async (email, password) => {
  try {
    // Find user by email (includes password field)
    const user = await User.findByEmail(email);
    
    // User not found
    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // Check if user account is active
    if (user.status !== 'active') {
      return {
        success: false,
        message: 'Account is not active. Please contact support.'
      };
    }
    
    // Compare passwords using the schema method
    const passwordMatch = await user.comparePassword(password);
    
    if (!passwordMatch) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate token
    const token = generateToken({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    });
    
    // Remove password from user object before returning
    const userObject = user.toObject();
    delete userObject.password;
    
    return {
      success: true,
      token,
      user: userObject
    };
  } catch (error) {
    console.error('Error logging in user:', error.message);
    throw error;
  }
};

// Get user by ID
const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    console.error('Error getting user by ID:', error.message);
    throw error;
  }
};

// Validate user credentials (for middleware use)
const validateUser = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return null;
    }

    // Check if user account is still active
    if (user.status !== 'active') {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error validating user:', error.message);
    return null;
  }
};

// Change user password
const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    // Find user with password
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Verify current password
    const passwordMatch = await user.comparePassword(currentPassword);
    if (!passwordMatch) {
      return {
        success: false,
        message: 'Current password is incorrect'
      };
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    return {
      success: true,
      message: 'Password changed successfully'
    };
  } catch (error) {
    console.error('Error changing password:', error.message);
    throw error;
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  validateUser,
  changePassword
};