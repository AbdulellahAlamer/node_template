const jwt = require('jwt-simple');
const { verifyToken } = require('../utils/jwtUtils');

const authenticate = (req, res, next) => {
  // Check if X-Auth header exists
  const token = req.headers['x-auth'];
  
  if (!token) {
    return res.status(401).json({ error: 'Missing authentication token' });
  }
  
  try {
    // Verify and decode the token
    const decoded = verifyToken(token);
    
    // Add user data to request for use in route handlers
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid authentication token' });
  }
};

module.exports = authenticate;