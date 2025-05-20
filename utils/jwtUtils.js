const jwt = require('jwt-simple');

// Secret key from environment variables - NEVER hardcode this
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-for-development-only';


// Generate a JWT token for a user
const generateToken = (payload) => {
  // Add expiration to the token (e.g., 24 hours)
  const tokenData = {
    ...payload,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  
  return jwt.encode(tokenData, SECRET_KEY);
};

// Verify and decode a JWT token
const verifyToken = (token) => {
  try {
    const decoded = jwt.decode(token, SECRET_KEY);
    
    // Check if token has expired
    if (decoded.exp && decoded.exp < Date.now()) {
      throw new Error('Token has expired');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = {
  generateToken,
  verifyToken
};