const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');

const adminAuth = async (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    let token = req.cookies.jwt;
    
    // If no cookie, check Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if user is admin
    if (!user.isAdmin()) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware for specific admin permissions
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user.hasPermission(permission)) {
        return res.status(403).json({ 
          message: `Access denied. ${permission} permission required.` 
        });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };
};

module.exports = { adminAuth, requirePermission }; 