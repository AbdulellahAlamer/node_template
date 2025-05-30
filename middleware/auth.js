const { verifyToken } = require('../utils/jwtUtils');

// Authentication middleware
const auth = (req, res, next) => {
  // Check for token in Authorization header (Bearer token) or x-auth header
  const authHeader = req.headers.authorization;
  const xAuthHeader = req.headers['x-auth'];
  
  let token;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7); // Remove 'Bearer ' prefix
  } else if (xAuthHeader) {
    token = xAuthHeader;
  }
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = auth;