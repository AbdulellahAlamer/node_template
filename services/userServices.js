const User = require('../models/user');

const getAllUsers = async () => {
  try {

    let users;
    
    // For MongoDB with mongoose
    if (User.find) {
      users = await User.find({}).select('-__v');
    }
    // For SQL databases
    else if (User.findAll) {
      users = await User.findAll();
    }
    // Fallback to custom implementation
    else {
      // This would be a custom implementation based on your database
      // Query implementation details would be handled in the User model
      users = await User.getAll();
    }
    
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
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

const updateUser = async (userId, updateData) => {
  try {
    // Implementation depends on database type being used
    // Generic implementation below
    let updatedUser;
    
    // For MongoDB with mongoose
    if (User.findByIdAndUpdate) {
      updatedUser = await User.findByIdAndUpdate(
        userId, 
        { $set: updateData },
        { new: true }
      );
    }
    // For SQL databases or custom implementation
    else {
      // This would be a custom implementation based on your database
      updatedUser = await User.update(userId, updateData);
    }
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

const deleteUser = async (userId) => {
  try {
    // Implementation depends on database type being used
    // Generic implementation below
    let result;
    
    // For MongoDB with mongoose
    if (User.findByIdAndDelete) {
      result = await User.findByIdAndDelete(userId);
    }
    // For SQL databases or custom implementation
    else {
      // This would be a custom implementation based on your database
      result = await User.delete(userId);
    }
    
    return !!result;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};