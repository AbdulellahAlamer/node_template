const bcrypt = require('bcrypt');
const User = require('../models/user');
const { generateToken } = require('../utils/jwtUtils');

const registerUser = async (username, password, email) => {
  try {
    // Hash password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create new user
    const newUser = await User.create({
      username,
      password: hashedPassword,
      email
    });
    
    return newUser;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};


// Authenticate user login
const loginUser = async (username, password) => {
  try {
    // Find user by username
    const user = await User.findByUsername(username);
    
    // User not found
    if (!user) {
      return {
        success: false,
        message: 'Invalid username or password'
      };
    }
    
    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return {
        success: false,
        message: 'Invalid username or password'
      };
    }
    
    // Generate token
    const token = generateToken({
      id: user.id,
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