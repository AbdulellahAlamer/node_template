const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: err.message 
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      error: 'Authentication error', 
      details: err.message 
    });
  }
  
  // Default to 500 internal server error for unhandled errors
  return res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
};

module.exports = errorHandler;