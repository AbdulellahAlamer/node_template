const path = require('path');
const fs = require('fs');

// Load environment variables from config.env file
const loadEnvironmentVariables = () => {
  const envPath = path.join(__dirname, '../config.env');
  
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
  } else {
    console.warn('⚠️  config.env file not found. Using system environment variables.');
  }
};

// Initialize environment variables
loadEnvironmentVariables();

// Environment detection helpers
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
const isDevelopment = NODE_ENV === 'development';
const isTest = NODE_ENV === 'test';

// Configuration validation utilities
const validateConfig = () => {
  const errors = [];
  const warnings = [];
  
  // Required environment variables
  const requiredVars = ['JWT_SECRET'];
  
  // Additional required variables in production
  if (isProduction) {
    requiredVars.push('DATABASE');
  }
  
  // Check for missing required variables
  const missingVars = requiredVars.filter(key => 
    !process.env[key] || process.env[key].trim() === ''
  );
  
  if (missingVars.length > 0) {
    errors.push(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  // Validate JWT secret strength
  if (process.env.JWT_SECRET) {
    if (isProduction && process.env.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET should be at least 32 characters long in production');
    }
    
    if (process.env.JWT_SECRET === 'your-secret-key-for-development-only') {
      warnings.push('Using default JWT secret. Please set a custom JWT_SECRET in your environment.');
    }
  }
  
  // Validate database connection string
  if (process.env.DATABASE && !process.env.DATABASE.startsWith('mongodb')) {
    errors.push('DATABASE must be a valid MongoDB connection string starting with "mongodb"');
  }
  
  // Validate port number
  const port = parseInt(process.env.PORT, 10);
  if (process.env.PORT && (isNaN(port) || port < 1 || port > 65535)) {
    errors.push('PORT must be a valid port number between 1 and 65535');
  }
  
  // Validate CORS origins
  if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*') {
    const origins = process.env.CORS_ORIGIN.split(',');
    const invalidOrigins = origins.filter(origin => {
      try {
        new URL(origin.trim());
        return false;
      } catch {
        return true;
      }
    });
    
    if (invalidOrigins.length > 0) {
      warnings.push(`Invalid CORS origins detected: ${invalidOrigins.join(', ')}`);
    }
  }
  
  // Log warnings
  if (warnings.length > 0 && isDevelopment) {
    console.warn('⚠️  Configuration warnings:');
    warnings.forEach(warning => console.warn(`   - ${warning}`));
  }
  
  // Throw errors
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`);
  }
};

// Database URI processing utility
const processDbUri = (uri, password) => {
  if (!uri) return uri;
  
  // Handle password replacement for MongoDB Atlas
  if (uri.includes('<password>') && password) {
    return uri.replace('<password>', encodeURIComponent(password));
  }
  
  return uri;
};

// Parse boolean environment variables
const parseBoolean = (value, defaultValue = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return defaultValue;
};

// Parse integer with validation
const parseInteger = (value, defaultValue, min = null, max = null) => {
  const parsed = parseInt(value, 10);
  
  if (isNaN(parsed)) return defaultValue;
  if (min !== null && parsed < min) return defaultValue;
  if (max !== null && parsed > max) return defaultValue;
  
  return parsed;
};

// Parse comma-separated values
const parseArray = (value, defaultValue = []) => {
  if (!value) return defaultValue;
  if (Array.isArray(value)) return value;
  
  return value.split(',').map(item => item.trim()).filter(Boolean);
};

// Main configuration object
const config = {
  // Application settings
  app: {
    name: process.env.APP_NAME || 'Node Template API',
    version: process.env.npm_package_version || '1.0.0',
    port: parseInteger(process.env.PORT, 5000, 1, 65535),
    host: process.env.HOST || 'localhost',
    environment: NODE_ENV,
    apiPrefix: process.env.API_PREFIX || '/api',
    
    // Environment flags
    isProduction,
    isDevelopment,
    isTest,
    
    // Application URLs (computed)
    get baseUrl() {
      const protocol = this.isProduction ? 'https' : 'http';
      return `${protocol}://${this.host}${this.port !== 80 && this.port !== 443 ? `:${this.port}` : ''}`;
    },
    
    get apiUrl() {
      return `${this.baseUrl}${this.apiPrefix}`;
    }
  },
  
  // Database configuration
  db: {
    uri: process.env.DATABASE || 'mongodb://localhost:27017/node_template',
    password: process.env.DATABASE_PASSWORD || '',
    
    // Connection options
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: parseInteger(process.env.DB_SERVER_SELECTION_TIMEOUT, 5000),
      socketTimeoutMS: parseInteger(process.env.DB_SOCKET_TIMEOUT, 45000),
      maxPoolSize: parseInteger(process.env.DB_MAX_POOL_SIZE, 10),
      minPoolSize: parseInteger(process.env.DB_MIN_POOL_SIZE, 0),
      bufferMaxEntries: 0,
      bufferCommands: false,
      heartbeatFrequencyMS: parseInteger(process.env.DB_HEARTBEAT_FREQUENCY, 10000),
      
      // Additional production settings
      ...(isProduction && {
        retryWrites: true,
        w: 'majority',
        readPreference: 'primaryPreferred'
      })
    },
    
    // Computed processed URI
    get processedUri() {
      return processDbUri(this.uri, this.password);
    }
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-for-development-only',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    algorithm: process.env.JWT_ALGORITHM || 'HS256',
    issuer: process.env.JWT_ISSUER || process.env.APP_NAME || 'Node Template API',
    audience: process.env.JWT_AUDIENCE || process.env.APP_NAME || 'Node Template API',
    
    // Cookie settings
    cookie: {
      name: process.env.JWT_COOKIE_NAME || 'jwt',
      expiresIn: parseInteger(process.env.JWT_COOKIE_EXPIRES_IN, 1), // days
      httpOnly: parseBoolean(process.env.JWT_COOKIE_HTTP_ONLY, true),
      secure: parseBoolean(process.env.JWT_COOKIE_SECURE, isProduction),
      sameSite: process.env.JWT_COOKIE_SAME_SITE || (isProduction ? 'strict' : 'lax'),
      
      get maxAge() {
        return this.expiresIn * 24 * 60 * 60 * 1000; // Convert days to milliseconds
      }
    }
  },
  
  // Security configuration
  security: {
    // Rate limiting
    rateLimit: {
      windowMs: parseInteger(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000), // 15 minutes
      max: parseInteger(process.env.RATE_LIMIT_MAX, 100),
      skipSuccessfulRequests: parseBoolean(process.env.RATE_LIMIT_SKIP_SUCCESSFUL, false),
      skipFailedRequests: parseBoolean(process.env.RATE_LIMIT_SKIP_FAILED, false),
      standardHeaders: true,
      legacyHeaders: false,
      
      message: {
        error: 'Too many requests from this IP, please try again later.',
        get retryAfter() {
          return Math.ceil(config.security.rateLimit.windowMs / 1000);
        }
      }
    },
    
    // CORS configuration
    cors: {
      origin: (() => {
        const corsOrigin = process.env.CORS_ORIGIN;
        if (!corsOrigin || corsOrigin === '*') return true;
        return parseArray(corsOrigin, ['http://localhost:3000']);
      })(),
      methods: parseArray(process.env.CORS_METHODS, ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']),
      allowedHeaders: parseArray(process.env.CORS_ALLOWED_HEADERS, [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With',
        'Accept',
        'Origin'
      ]),
      credentials: parseBoolean(process.env.CORS_CREDENTIALS, true),
      maxAge: parseInteger(process.env.CORS_MAX_AGE, 86400), // 24 hours
      preflightContinue: false,
      optionsSuccessStatus: 204
    },
    
    // Helmet configuration
    helmet: {
      contentSecurityPolicy: isProduction ? undefined : false,
      crossOriginEmbedderPolicy: isProduction,
      crossOriginOpenerPolicy: isProduction,
      crossOriginResourcePolicy: isProduction ? { policy: "cross-origin" } : false,
      hsts: isProduction ? {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
      } : false
    },
    
    // Password hashing
    bcrypt: {
      saltRounds: parseInteger(process.env.BCRYPT_SALT_ROUNDS, 12, 4, 20)
    },
    
    // Trust proxy settings
    trustProxy: parseBoolean(process.env.TRUST_PROXY, false)
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
    format: process.env.LOG_FORMAT || (isProduction ? 'combined' : 'dev'),
    morgan: process.env.MORGAN_FORMAT || (isProduction ? 'combined' : 'dev'),
    
    // Console logging
    console: {
      enabled: parseBoolean(process.env.LOG_CONSOLE_ENABLED, true),
      colorize: parseBoolean(process.env.LOG_CONSOLE_COLORIZE, isDevelopment),
      timestamp: parseBoolean(process.env.LOG_CONSOLE_TIMESTAMP, true)
    },
    
    // File logging
    file: {
      enabled: parseBoolean(process.env.LOG_TO_FILE, false),
      path: process.env.LOG_FILE_PATH || './logs/app.log',
      maxSize: process.env.LOG_MAX_SIZE || '10m',
      maxFiles: parseInteger(process.env.LOG_MAX_FILES, 5),
      datePattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD'
    },
    
    // Request logging
    request: {
      enabled: parseBoolean(process.env.LOG_REQUESTS, true),
      excludePaths: parseArray(process.env.LOG_EXCLUDE_PATHS, ['/health', '/favicon.ico'])
    }
  },
  
  // Error handling configuration
  errorHandling: {
    showStack: parseBoolean(process.env.SHOW_ERROR_STACK, !isProduction),
    logErrors: parseBoolean(process.env.LOG_ERRORS, true),
    logLevel: process.env.ERROR_LOG_LEVEL || 'error',
    trustProxy: parseBoolean(process.env.TRUST_PROXY, false),
    
    // Error response settings
    includeErrorDetails: !isProduction,
    sanitizeErrors: isProduction
  },
  
  // Validation rules
  validation: {
    password: {
      minLength: parseInteger(process.env.PASSWORD_MIN_LENGTH, 6, 1, 128),
      maxLength: parseInteger(process.env.PASSWORD_MAX_LENGTH, 128, 1, 1024),
      requireUppercase: parseBoolean(process.env.PASSWORD_REQUIRE_UPPERCASE, false),
      requireLowercase: parseBoolean(process.env.PASSWORD_REQUIRE_LOWERCASE, false),
      requireNumbers: parseBoolean(process.env.PASSWORD_REQUIRE_NUMBERS, false),
      requireSpecialChars: parseBoolean(process.env.PASSWORD_REQUIRE_SPECIAL, false),
      
      // Password strength regex (computed)
      get regex() {
        let pattern = '^';
        if (this.requireUppercase) pattern += '(?=.*[A-Z])';
        if (this.requireLowercase) pattern += '(?=.*[a-z])';
        if (this.requireNumbers) pattern += '(?=.*\\d)';
        if (this.requireSpecialChars) pattern += '(?=.*[!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>\\/?])';
        pattern += `.{${this.minLength},${this.maxLength}}$`;
        return new RegExp(pattern);
      }
    },
    
    username: {
      minLength: parseInteger(process.env.USERNAME_MIN_LENGTH, 3, 1, 50),
      maxLength: parseInteger(process.env.USERNAME_MAX_LENGTH, 30, 1, 100),
      allowedChars: process.env.USERNAME_ALLOWED_CHARS || 'alphanumeric',
      
      // Username regex (computed)
      get regex() {
        switch (this.allowedChars) {
          case 'alphanumeric':
            return /^[a-zA-Z0-9]+$/;
          case 'alphanumeric_underscore':
            return /^[a-zA-Z0-9_]+$/;
          case 'alphanumeric_underscore_dash':
            return /^[a-zA-Z0-9_-]+$/;
          default:
            return /^[a-zA-Z0-9]+$/;
        }
      }
    },
    
    email: {
      regex: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      maxLength: parseInteger(process.env.EMAIL_MAX_LENGTH, 254, 1, 320)
    }
  },
  
  // File upload configuration
  upload: {
    maxFileSize: parseInteger(process.env.UPLOAD_MAX_FILE_SIZE, 10 * 1024 * 1024), // 10MB
    maxFiles: parseInteger(process.env.UPLOAD_MAX_FILES, 5),
    allowedTypes: parseArray(process.env.UPLOAD_ALLOWED_TYPES, [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf'
    ]),
    destination: process.env.UPLOAD_DESTINATION || './uploads/',
    
    // File naming
    preserveFileName: parseBoolean(process.env.UPLOAD_PRESERVE_FILENAME, false),
    filenameLength: parseInteger(process.env.UPLOAD_FILENAME_LENGTH, 32)
  },
  
  // Development settings
  development: {
    seedData: parseBoolean(process.env.DEV_SEED_DATA, false),
    mockEmail: parseBoolean(process.env.DEV_MOCK_EMAIL, true),
    debugRoutes: parseBoolean(process.env.DEV_DEBUG_ROUTES, false),
    verboseLogging: parseBoolean(process.env.DEV_VERBOSE_LOGGING, false)
  },
  
  // Performance settings
  performance: {
    compression: parseBoolean(process.env.ENABLE_COMPRESSION, true),
    cacheControl: parseBoolean(process.env.ENABLE_CACHE_CONTROL, isProduction),
    etag: parseBoolean(process.env.ENABLE_ETAG, isProduction),
    
    // Request timeouts
    requestTimeout: parseInteger(process.env.REQUEST_TIMEOUT, 30000), // 30 seconds
    keepAliveTimeout: parseInteger(process.env.KEEP_ALIVE_TIMEOUT, 5000) // 5 seconds
  }
};

// Configuration methods
config.getEnvironmentInfo = () => ({
  environment: config.app.environment,
  version: config.app.version,
  node: process.version,
  platform: process.platform,
  uptime: process.uptime(),
  memory: process.memoryUsage()
});

config.isDatabaseConfigured = () => {
  return !!(config.db.uri && config.db.uri !== 'mongodb://localhost:27017/node_template');
};

config.isJWTConfigured = () => {
  return !!(config.jwt.secret && config.jwt.secret !== 'your-secret-key-for-development-only');
};

config.getSecuritySummary = () => ({
  httpsEnabled: config.jwt.cookie.secure,
  corsConfigured: Array.isArray(config.security.cors.origin) || config.security.cors.origin !== true,
  rateLimitEnabled: config.security.rateLimit.max > 0,
  helmetEnabled: config.security.helmet.contentSecurityPolicy !== false,
  jwtSecure: config.jwt.secret.length >= 32
});

// Validate configuration on load
try {
  validateConfig();
} catch (error) {
  console.error('❌ Configuration Error:', error.message);
  process.exit(1);
}

// Log configuration summary in development
if (isDevelopment) {
  console.log('🔧 Configuration loaded:');
  console.log(`   Environment: ${config.app.environment}`);
  console.log(`   Port: ${config.app.port}`);
  console.log(`   Database: ${config.db.uri.includes('localhost') ? 'Local MongoDB' : 'Remote MongoDB'}`);
  console.log(`   JWT configured: ${config.isJWTConfigured() ? '✅' : '⚠️'}`);
  console.log(`   CORS origins: ${Array.isArray(config.security.cors.origin) ? config.security.cors.origin.length : 'All'}`);
}

module.exports = config;