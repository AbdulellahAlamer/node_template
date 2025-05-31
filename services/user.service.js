const User = require('../models/user.model'); // Fixed: was user.schema

const getAllUsers = async () => {
  try {
    const users = await User.find({}).select('-password -__v');
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password');
    return user;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};

const updateUser = async (userId, updateData) => {
  try {
    // Remove sensitive fields that shouldn't be updated directly
    const { password, role, ...safeUpdateData } = updateData;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { $set: safeUpdateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

const deleteUser = async (userId) => {
  try {
    const result = await User.findByIdAndDelete(userId);
    return !!result;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Additional utility functions
const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select('-password');
    return user;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
};

const getUserByUsername = async (username) => {
  try {
    const user = await User.findOne({ username }).select('-password');
    return user;
  } catch (error) {
    console.error('Error getting user by username:', error);
    throw error;
  }
};

const updateUserRole = async (userId, role) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

const updateUserStatus = async (userId, status) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true, runValidators: true }
    ).select('-password');
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserByEmail,
  getUserByUsername,
  updateUserRole,
  updateUserStatus
};