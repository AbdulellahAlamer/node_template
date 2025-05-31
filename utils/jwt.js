const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Generate JWT token
const generateToken = (payload) => {
  try {
    const tokenPayload = {
      id: payload.id,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      iat: Math.floor(Date.now() / 1000) // Issued at time in seconds
    };

    return jwt.sign(
      tokenPayload,
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn,
        issuer: config.app.name,
        audience: config.app.name
      }
    );
  } catch (error) {
    console.error('Error generating token:', error.message);
    throw new Error('Token generation failed');
  }
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: config.app.name,
      audience: config.app.name
    });
    
    return {
      success: true,
      decoded
    };
  } catch (error) {
    console.error('Error verifying token:', error.message);
    
    let message = 'Token verification failed';
    
    if (error.name === 'TokenExpiredError') {
      message = 'Token has expired';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token';
    } else if (error.name === 'NotBeforeError') {
      message = 'Token not active yet';
    }
    
    return {
      success: false,
      error: error.name,
      message
    };
  }
};

// Decode token without verification (for debugging)
const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    console.error('Error decoding token:', error.message);
    return null;
  }
};

// Get token expiration date
const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch (error) {
    console.error('Error getting token expiration:', error.message);
    return null;
  }
};

// Check if token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      return Date.now() >= decoded.exp * 1000;
    }
    return true; // If we can't determine expiration, consider it expired
  } catch (error) {
    console.error('Error checking token expiration:', error.message);
    return true;
  }
};

// Refresh token (generate new token with updated info)
const refreshToken = (oldToken, newPayload = {}) => {
  try {
    const decoded = jwt.decode(oldToken);
    if (!decoded) {
      throw new Error('Invalid token to refresh');
    }

    // Merge old payload with new data
    const payload = {
      id: newPayload.id || decoded.id,
      username: newPayload.username || decoded.username,
      email: newPayload.email || decoded.email,
      role: newPayload.role || decoded.role
    };

    return generateToken(payload);
  } catch (error) {
    console.error('Error refreshing token:', error.message);
    throw new Error('Token refresh failed');
  }
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  getTokenExpiration,
  isTokenExpired,
  refreshToken
};