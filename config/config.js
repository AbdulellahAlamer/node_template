module.exports = {
  app: {
    name: process.env.APP_NAME || 'Node Template API',
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
    apiPrefix: process.env.API_PREFIX || '/api',
    host: process.env.HOST || 'localhost'
  },
  
  db: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/node_template',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-for-development-only',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    cookieExpiresIn: process.env.JWT_COOKIE_EXPIRES_IN || 1
  },
  
  security: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    },
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Auth']
    }
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'dev'
  }
};