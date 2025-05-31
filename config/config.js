const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config.env') });

const config = {
  app: {
    name: process.env.APP_NAME || 'Node Template API',
    port: parseInt(process.env.PORT, 10) || 5000, // Fixed: was 3000, should match common usage
    environment: process.env.NODE_ENV || 'development',
    apiPrefix: process.env.API_PREFIX || '/api',
    host: process.env.HOST || 'localhost',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    isTest: process.env.NODE_ENV === 'test'
  },
  
  db: {
    uri: process.env.DATABASE || 'mongodb://localhost:27017/node_template',
    password: process.env.DATABASE_PASSWORD || '',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10, // Added connection pool size
      bufferMaxEntries: 0,
      bufferCommands: false,
    }
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-for-development-only',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    cookieExpiresIn: parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) || 1,
    algorithm: 'HS256' // Added explicit algorithm
  },
  
  security: {
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: 15 * 60 // 15 minutes in seconds
      },
      standardHeaders: true,
      legacyHeaders: false
    },
    cors: {
      origin: process.env.CORS_ORIGIN === '*' ? true : process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true,
      maxAge: 86400 // 24 hours
    },
    helmet: {
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production'
    },
    bcrypt: {
      saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12
    }
  },
  
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    format: process.env.LOG_FORMAT || 'dev',
    morgan: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
    file: {
      enabled: process.env.LOG_TO_FILE === 'true',
      path: process.env.LOG_FILE_PATH || './logs/app.log',
      maxSize: process.env.LOG_MAX_SIZE || '10m',
      maxFiles: process.env.LOG_MAX_FILES || '5'
    }
  },

  errorHandling: {
    showStack: process.env.NODE_ENV !== 'production',
    logErrors: true,
    trustProxy: process.env.TRUST_PROXY === 'true'
  },

  validation: {
    password: {
      minLength: parseInt(process.env.PASSWORD_MIN_LENGTH, 10) || 6,
      maxLength: parseInt(process.env.PASSWORD_MAX_LENGTH, 10) || 128,
      requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE === 'true',
      requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE === 'true',
      requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS === 'true',
      requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL === 'true'
    },
    username: {
      minLength: parseInt(process.env.USERNAME_MIN_LENGTH, 10) || 3,
      maxLength: parseInt(process.env.USERNAME_MAX_LENGTH, 10) || 30,
      allowedChars: process.env.USERNAME_ALLOWED_CHARS || 'alphanumeric'
    }
  }
};

// Configuration validation
const validateConfig = () => {
  const errors = [];
  
  // Required in all environments
  const required = ['JWT_SECRET'];
  
  // Additional required in production
  if (config.app.isProduction) {
    required.push('DATABASE');
  }
  
  const missing = required.filter(key => !process.env[key] || process.env[key].trim() === '');
  
  if (missing.length > 0) {
    errors.push(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate JWT secret strength in production
  if (config.app.isProduction && process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET should be at least 32 characters long in production');
  }
  
  // Validate database connection string format
  if (process.env.DATABASE && !process.env.DATABASE.startsWith('mongodb')) {
    errors.push('DATABASE must be a valid MongoDB connection string');
  }
  
  // Validate port number
  if (isNaN(config.app.port) || config.app.port < 1 || config.app.port > 65535) {
    errors.push('PORT must be a valid port number between 1 and 65535');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
};

// Enhanced validation for production
if (config.app.isProduction) {
  validateConfig();
} else if (config.app.isDevelopment) {
  // Warn about development-only settings
  if (process.env.JWT_SECRET === 'your-secret-key-for-development-only') {
    console.warn('⚠️  Warning: Using default JWT secret. Please set JWT_SECRET in your environment.');
  }
}

// Database URI processing
const processDbUri = () => {
  let uri = config.db.uri;
  
  // Handle password replacement for MongoDB Atlas
  if (uri.includes('<password>') && config.db.password) {
    uri = uri.replace('<password>', encodeURIComponent(config.db.password));
  }
  
  return uri;
};

config.db.processedUri = processDbUri();

module.exports = config;