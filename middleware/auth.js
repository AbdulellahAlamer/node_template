const { verifyToken } = require('../utils/jwtUtils');
const createMiddleware = require('./base');

// Simple auth factory
const createAuth = (options = {}) => {
  const auth = (req, res, next) => {
    const token = req.headers['x-auth'];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
      req.user = verifyToken(token);
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  return createMiddleware(auth, { priority: 3 });
};

// Default auth
const auth = createAuth();

module.exports = { createAuth, auth };