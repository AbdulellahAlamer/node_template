const User = require('../models/userSchema');

// Get all users (with pagination)
exports.getAllUsers = async (req, res) => {
  try {
    console.log('Query:', req.query); // log full query

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = {};
    // Add role filter if provided
    if (req.query.role) {
      filter.role = req.query.role;
    }
    // Add name search filter if provided
    if (req.query.search) {
      filter.username = { $regex: req.query.search, $options: 'i' }; // Case-insensitive search by username
    }
    console.log('Filters applied:', filter); // Log applied filters for debugging

    const users = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};


// Update user role and permissions
exports.updateUserRole = async (req, res) => {
  try {

  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Error updating user role' });
  }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const activeUsers = await User.countDocuments({ 'admin.lastLogin': { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });

    res.json({
      totalUsers,
      totalAdmins,
      activeUsers,
      userGrowth: {
        last30Days: await User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
        last7Days: await User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } })
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user statistics' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Use findByIdAndDelete instead of the deprecated remove() method
    await User.findByIdAndDelete(userId);
    
    res.json({ 
      message: 'User deleted successfully',
      deletedUserId: userId
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// Update admin permissions
exports.updateAdminPermissions = async (req, res) => {
  try {

  } catch (error) {
    console.error('Error updating admin permissions:', error);
    res.status(500).json({ message: 'Error updating admin permissions' });
  }
};

// Track admin login
exports.trackAdminLogin = async (userId, ip, device) => {
  try {
    const user = await User.findById(userId);
    
    if (user && user.role === 'admin') {
      // Update last login time
      user.admin.lastLogin = new Date();
      
      // Add to login history (limit to most recent 10 logins)
      user.admin.loginHistory.unshift({
        timestamp: new Date(),
        ip: ip || 'unknown',
        device: device || 'unknown'
      });
      
      // Keep only the most recent 10 entries
      if (user.admin.loginHistory.length > 10) {
        user.admin.loginHistory = user.admin.loginHistory.slice(0, 10);
      }
      
      await user.save();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error tracking admin login:', error);
    return false;
  }
};