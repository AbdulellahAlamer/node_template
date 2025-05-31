# Node Template API

A production-ready Node.js/Express API template with comprehensive security, validation, and monitoring features.

## Core Features

- **Authentication & Authorization**
  - JWT-based auth (header or HttpOnly cookie)
  - Role-based access control (user/admin)
  - Permission-based actions
  - Secure password handling with bcrypt
  - Password change functionality
  - Last login tracking
  - Account status management (active/inactive/suspended)
  - Token refresh mechanism
  - Secure logout with cookie clearing
  - Token debugging utilities
  - Expiration management
  - Issuer/Audience validation

- **Database & Storage**
  - MongoDB with Mongoose ODM
  - MongoDB Atlas support
  - Connection string encryption
  - Password protection
  - Connection pooling
  - Health monitoring
  - Automatic reconnection
  - Query optimization

- **User Management**
  - Profile management (firstName, lastName, avatar, bio)
  - Role management (user/admin)
  - Status management (active/inactive/suspended)
  - Username/email uniqueness validation
  - Safe field updates (protected fields)
  - Multiple update methods (PUT/PATCH)

- **Validation & Error Handling**
  - Multi-layer validation (model, controller, service)
  - Centralized error handling
  - Consistent error responses
  - Field-level validation messages
  - Duplicate key detection
  - Custom validation rules
  - Request sanitization

- **Security**
  - Helmet security headers
  - Configurable CORS
  - Rate limiting per IP
  - Environment-based security
  - MongoDB security best practices
  - Password strength validation
  - Request sanitization
  - Cookie security options
  - Token refresh mechanism
  - Connection string encryption
  - Token payload validation

- **Testing**
  - Jest & Supertest integration
  - Separate test database
  - Automated test suite
  - Database cleanup
  - Authentication tests
  - Error case coverage
  - CI/CD ready

- **Monitoring & Health**
  - Health check endpoint
  - Memory usage monitoring
  - Database connection status
  - Environment information
  - Uptime tracking
  - Error logging
  - Request logging
  - Database latency tracking
  - Connection state monitoring

## Project Structure
```
.
├── api/
│   └── server.js          # Express app setup, middleware, error handling
├── config/
│   ├── config.js          # Configuration with validation
│   └── db.js             # Database connection & health checks
├── controllers/          # Route handlers
│   ├── auth.controller.js # Authentication & authorization
│   └── user.controller.js # User management
├── middleware/          # Auth & validation middleware
│   ├── protectRoute.js   # JWT verification
│   └── adminAuth.js      # Admin role check
├── models/              # Mongoose schemas
│   └── user.model.js     # User model with validation
├── routes/              # API routes
│   ├── auth.routes.js    # Authentication routes
│   └── user.routes.js    # User management routes
├── services/           # Business logic
│   ├── auth.service.js   # Auth operations
│   └── user.service.js   # User operations
├── utils/              # Helper functions
│   └── jwt.js           # JWT generation, verification & management
├── tests/              # Jest tests
│   └── auth.test.js     # Authentication tests
├── config.env          # Environment variables
├── config.env.example  # Environment template
├── package.json        # Dependencies and scripts
└── .gitignore         # Git ignore rules
```

## Dependencies

### Production Dependencies
- express: Web framework
- mongoose: MongoDB ODM
- jsonwebtoken: JWT authentication
- bcrypt: Password hashing
- cors: CORS middleware
- helmet: Security headers
- express-rate-limit: Rate limiting
- morgan: HTTP request logging
- body-parser: Request body parsing
- dotenv: Environment variables

### Development Dependencies
- jest: Testing framework
- supertest: HTTP testing
- nodemon: Development server
- eslint: Code linting
- prettier: Code formatting

## Quick Start

```bash
# Install dependencies
npm install

# Copy and configure environment variables
cp config.env.example config.env

# Start development server
npm run dev

# Or production
npm start
```

## Configuration

Key environment variables (see config.env.example for all options):

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment | development |
| PORT | Server port | 5000 |
| API_PREFIX | API route prefix | /api |
| HOST | Server host | localhost |
| APP_NAME | Application name | Node Template API |
| DATABASE | MongoDB URI | mongodb://localhost:27017/node_template |
| DATABASE_TEST | Test MongoDB URI | mongodb://localhost:27017/node_template_test |
| JWT_SECRET | JWT signing key | Required in production |
| JWT_EXPIRES_IN | Token lifetime | 24h |
| JWT_COOKIE_EXPIRES_IN | Cookie lifetime (days) | 1 |
| CORS_ORIGIN | Allowed origins | http://localhost:3000 |
| RATE_LIMIT_WINDOW_MS | Rate limit window | 900000 (15min) |
| RATE_LIMIT_MAX | Max requests per window | 100 |
| TRUST_PROXY | Trust proxy headers | false |
| PASSWORD_MIN_LENGTH | Minimum password length | 6 |
| PASSWORD_MAX_LENGTH | Maximum password length | 128 |
| BCRYPT_SALT_ROUNDS | Password hashing cost | 12 |
| LOG_LEVEL | Logging level | debug |
| LOG_FORMAT | Log format | dev |
| LOG_TO_FILE | Enable file logging | false |
| LOG_FILE_PATH | Log file location | ./logs/app.log |
| USERNAME_MIN_LENGTH | Min username length | 3 |
| USERNAME_MAX_LENGTH | Max username length | 30 |
| DB_MAX_POOL_SIZE | MongoDB pool size | 10 |
| DB_SOCKET_TIMEOUT | Socket timeout (ms) | 45000 |

## Scripts

```bash
# Development
npm run dev         # Start development server with nodemon

# Production
npm start          # Start production server

# Testing
npm test           # Run all tests
npm run test:watch # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Code Quality
npm run lint      # Run ESLint
npm run format    # Format code with Prettier
```

## API Routes

- **Auth** (`/api/auth`)
  - POST /register - Create account
  - POST /login - Authenticate
  - GET /me - Get profile
  - POST /logout - End session
  - POST /change-password - Update password
  - POST /refresh - Refresh token

- **Users** (`/api/users`)
  - GET / - List users (admin)
  - GET /:id - Get user
  - PUT /:id - Update user
  - PATCH /:id - Update user (partial)
  - DELETE /:id - Delete user
  - PATCH /:id/role - Update role (admin)
  - PATCH /:id/status - Update status (admin)

See [API.md](API.md) for detailed endpoint documentation.

## Testing

The project includes a comprehensive test suite using Jest and Supertest:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

Test configuration:
- Separate test database (DATABASE_TEST)
- Automatic database cleanup
- CI/CD compatible
- Increased timeouts for CI environments
- Error case coverage
- Authentication flow testing
- Coverage reporting
- Node test environment

## Development

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

## Production Deployment

1. Set secure environment variables:
   - Strong JWT_SECRET (32+ chars)
   - Production DATABASE URI
   - Appropriate CORS_ORIGIN
   - NODE_ENV=production
   - Secure BCRYPT_SALT_ROUNDS
   - JWT_ISSUER and JWT_AUDIENCE
   - Optimized DB_MAX_POOL_SIZE
   - Enable LOG_TO_FILE
   - Set LOG_LEVEL=info
   - Enable password requirements
   - Configure rate limiting

2. Enable security features:
   - HTTPS
   - Secure cookies
   - Rate limiting
   - Error sanitization
   - Production logging
   - Token refresh mechanism
   - Database encryption
   - Connection pooling
   - Trust proxy if needed
   - Strict password rules

3. Monitor health endpoint:
   - GET /health

## License

ISC © 2025 Abdulellah
