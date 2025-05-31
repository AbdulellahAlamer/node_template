const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const { generateToken } = require('../utils/jwt');

const registerUser = async (username, password, email) => {
  try {
    // Create new user (password will be hashed by the pre-save middleware)
    const newUser = await User.create({
      username,
      password,
      email
    });
    
    return newUser;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Authenticate user login
const loginUser = async (email, password) => {
  try {
    // Find user by email
    const user = await User.findByEmail(email).select('+password');
    
    // User not found
    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password'
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
      role: user.role
    });
    
    return {
      success: true,
      token,
      user
    };
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserById
};