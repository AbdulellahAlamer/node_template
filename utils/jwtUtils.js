const jwt = require('jwt-simple');

// Simple JWT utilities
const createJWTUtils = (options = {}) => {
  const secretKey = options.secretKey || process.env.JWT_SECRET;

  // Generate token
  const generateToken = (payload) => {
    const tokenData = {
      ...payload,
      iat: Date.now(),
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    return jwt.encode(tokenData, secretKey);
  };

  // Verify token
  const verifyToken = (token) => {
    try {
      const decoded = jwt.decode(token, secretKey);
      if (decoded.exp < Date.now()) throw new Error('Token expired');
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  };

  return { generateToken, verifyToken };
};

// Default instance
const { generateToken, verifyToken } = createJWTUtils();

module.exports = { createJWTUtils, generateToken, verifyToken };