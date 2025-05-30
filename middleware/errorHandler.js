const createMiddleware = require('./base');

// Simple error handler factory
const createErrorHandler = (options = {}) => {
  const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : err.message;

    res.status(status).json({ error: message });
  };

  return createMiddleware(errorHandler, { priority: 100 });
};

// Default error handler
const errorHandler = createErrorHandler();

module.exports = { createErrorHandler, errorHandler };