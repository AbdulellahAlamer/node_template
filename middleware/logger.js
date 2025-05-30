const morgan = require('morgan');
const createMiddleware = require('./base');

// Simple logger factory
const createLogger = () => {
  const format = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
  const logger = morgan(format);
  return createMiddleware(logger, { priority: 1 });
};

// Default logger
const logger = createLogger();

module.exports = { createLogger, logger }; 