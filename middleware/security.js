const cors = require("cors");
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const createMiddleware = require('./base');

// Trust the X-Forwarded-* headers
const trustProxy = (app) => {
  app.set("trust proxy", 2);
};

// Rate limiting configuration
const IP_WHITELIST = (process.env.IP_WHITELIST || "").split(",");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Simple CORS - allow all origins in development, specific in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? process.env.CORS_ORIGIN : '*'
};

// Security middleware array
const securityMiddleware = [
  // Trust proxy
  trustProxy,
  // Rate limiting
  limiter,
  // Sanitize MongoDB queries
  mongoSanitize(),
  // Set security headers
  helmet(),
  // Prevent XSS attacks
  xss(),
  // Prevent HTTP Parameter Pollution
  hpp(),
  // CORS
  cors(corsOptions)
];

// Simple security factory
const createSecurity = () => {
  const security = [
    helmet(),
    cors(),
    rateLimit({ 
      windowMs: 15 * 60 * 1000, 
      max: 100 
    })
  ];

  return createMiddleware(security, { priority: 1 });
};

// Default security
const security = createSecurity();

module.exports = { createSecurity, security }; 