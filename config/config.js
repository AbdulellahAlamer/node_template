const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config.env') });

const config = {
  app: {
    name: process.env.APP_NAME || 'Node Template API',
    port: parseInt(process.env.PORT, 10) || 3000,
    environment: process.env.NODE_ENV || 'development',
    apiPrefix: process.env.API_PREFIX || '/api',
    host: process.env.HOST || 'localhost',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development'
  },
  
  db: {
    uri: process.env.DATABASE || 'mongodb://localhost:27017/node_template',
    password: process.env.DATABASE_PASSWORD || '',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-for-development-only',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    cookieExpiresIn: parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) || 1
  },
  
  security: {
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
      max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100
    },
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Auth']
    },
    helmet: {
      contentSecurityPolicy: process.env.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production'
    }
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'dev',
    morgan: process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
  },

  errorHandling: {
    showStack: process.env.NODE_ENV !== 'production',
    logErrors: true
  }
};

// Validate required configuration
const validateConfig = () => {
  const required = ['JWT_SECRET', 'DATABASE'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Only validate in production
if (config.app.isProduction) {
  validateConfig();
}

module.exports = config;