const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const config = require('../config/config');

const protectRoute = async (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    let token = req.cookies?.jwt;
    
    // If no cookie, check Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Access denied. No token provided.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    if (!decoded) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Access denied. Invalid token.' 
      });
    }

    // Find user and exclude password
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ 
        status: 'error',
        message: 'User not found.' 
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        status: 'error',
        message: 'Account is not active.'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. Token expired.'
      });
    }
    
    return res.status(500).json({ 
      status: 'error',
      message: 'Internal server error.' 
    });
  }
};

module.exports = protectRoute;