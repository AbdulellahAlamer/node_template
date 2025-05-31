// config.js – lightweight, self-contained configuration loader
// ---------------------------------------------------------------------------
// 1.  Reads configuration exclusively from process.env (no external deps).
// 2.  Provides a single `config` export consumed across the codebase.
// 3.  Performs minimal validation so the app fails fast when essentials are
//     missing or malformed.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const NODE_ENV      = process.env.NODE_ENV || 'development';
const isProduction  = NODE_ENV === 'production';
const isDevelopment = NODE_ENV === 'development';
const isTest        = NODE_ENV === 'test';

const toInt = (val, def, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  const n = parseInt(val, 10);
  if (Number.isNaN(n)) return def;
  if (n < min) return def;
  if (n > max) return def;
  return n;
};

const toBool = (val, def = false) => {
  if (val === undefined) return def;
  if (typeof val === 'boolean') return val;
  return ['true', '1', 'yes', 'y'].includes(String(val).toLowerCase());
};

const splitCSV = (val, def = []) => (val ? String(val).split(',').map(s => s.trim()).filter(Boolean) : def);

const replacePassword = (uri, pwd) => uri.replace('<password>', encodeURIComponent(pwd || ''));

// ---------------------------------------------------------------------------
// Core config object
// ---------------------------------------------------------------------------
const config = {
  //--------------------------------------------------------------------------
  // Application basics
  //--------------------------------------------------------------------------
  app: {
    name        : process.env.APP_NAME   || 'Node Template API',
    port        : toInt(process.env.PORT, 5000, 1, 65535),
    host        : process.env.HOST       || 'localhost',
    apiPrefix   : process.env.API_PREFIX || '/api',
    environment : NODE_ENV,
    isProduction,
    isDevelopment,
    isTest
  },

  //--------------------------------------------------------------------------
  // Database (MongoDB)
  //--------------------------------------------------------------------------
  db: {
    uri      : process.env.DATABASE || 'mongodb://localhost:27017/node_template',
    password : process.env.DATABASE_PASSWORD || '',
    get processedUri() {
      return replacePassword(this.uri, this.password);
    },
    options  : {
      useNewUrlParser   : true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: toInt(process.env.DB_SERVER_SELECTION_TIMEOUT, 5000),
      socketTimeoutMS         : toInt(process.env.DB_SOCKET_TIMEOUT, 45000)
    }
  },

  //--------------------------------------------------------------------------
  // JWT settings
  //--------------------------------------------------------------------------
  jwt: {
    secret    : process.env.JWT_SECRET || (isProduction ? undefined : 'development-secret'),
    expiresIn : process.env.JWT_EXPIRES_IN || '24h',
    issuer    : process.env.JWT_ISSUER   || process.env.APP_NAME || 'Node Template API',
    audience  : process.env.JWT_AUDIENCE || process.env.APP_NAME || 'Node Template API'
  },

  //--------------------------------------------------------------------------
  // Security and misc.
  //--------------------------------------------------------------------------
  security: {
    bcryptSaltRounds: toInt(process.env.BCRYPT_SALT_ROUNDS, 12, 4, 20),
    rateLimit: {
      windowMs : toInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
      max      : toInt(process.env.RATE_LIMIT_MAX, 100),
      standardHeaders: true,
      legacyHeaders  : false
    },
    cors: {
      origin: (() => {
        const raw = process.env.CORS_ORIGIN;
        if (!raw || raw === '*') return '*';
        return splitCSV(raw, ['http://localhost:3000']);
      })(),
      methods: splitCSV(process.env.CORS_METHODS, ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'])
    }
  },

  //--------------------------------------------------------------------------
  // Logging / error handling
  //--------------------------------------------------------------------------
  logging: {
    morganFormat: process.env.MORGAN_FORMAT || (isProduction ? 'combined' : 'dev')
  },
  errorHandling: {
    showStack: toBool(process.env.SHOW_ERROR_STACK, !isProduction)
  }
};

// ---------------------------------------------------------------------------
// Validation – terminate the process if critical settings are missing.
// ---------------------------------------------------------------------------
(function validate () {
  const problems = [];

  // JWT secret must exist and be sufficiently long in production.
  if (!config.jwt.secret) {
    problems.push('JWT_SECRET is required');
  } else if (isProduction && config.jwt.secret.length < 32) {
    problems.push('JWT_SECRET should be at least 32 characters long in production');
  }

  // Mongo connection string sanity check.
  if (!config.db.uri.startsWith('mongodb')) {
    problems.push('DATABASE must be a valid MongoDB URI');
  }

  // API prefix sanity.
  if (!config.app.apiPrefix.startsWith('/')) {
    problems.push('API_PREFIX should begin with "/"');
  }

  // Rate limit window bounds.
  if (config.security.rateLimit.windowMs < 1000) {
    problems.push('RATE_LIMIT_WINDOW_MS should be at least 1000 (1 second)');
  }

  if (problems.length) {
    console.error('\n❌ Configuration validation failed:');
    problems.forEach(p => console.error(` • ${p}`));
    process.exit(1);
  }
})();

module.exports = config;

