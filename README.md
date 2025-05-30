# Node.js Backend Template

A minimal, secure, and reusable Node.js backend template with Express and MongoDB. This template provides a solid foundation for building scalable APIs with best practices and security in mind.

## Features

- Simple and reusable middleware system with priority-based execution
- JWT authentication with secure token handling
- Request validation with express-validator
- Centralized error handling
- Environment-aware logging
- Security middleware (Helmet, CORS, Rate Limiting)
- MongoDB integration with health checks
- Environment-based configuration
- TypeScript support ready

## Project Structure

```
.
├── api/
│   └── server.js          # Main application entry
├── config/
│   └── db.js             # Database configuration
├── middleware/
│   ├── auth.js           # Authentication middleware
│   ├── base.js           # Base middleware factory
│   ├── errorHandler.js   # Error handling middleware
│   ├── logger.js         # Request logging
│   ├── security.js       # Security middleware
│   └── validator.js      # Request validation
├── models/               # Database models
├── routes/              # API routes
├── utils/
│   └── jwtUtils.js      # JWT utilities
├── config.env           # Environment variables
├── config.env.example   # Example environment variables
└── package.json         # Project dependencies
```

## Quick Start

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy config.env.example to config.env and update values:
   ```bash
   cp config.env.example config.env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Configuration

Create a config.env file with the following variables:

```
# SERVER
NODE_ENV=development
PORT=5000
API_PREFIX=/api

# MONGODB
DATABASE=mongodb+srv://username:<password>@cluster.mongodb.net/dbname
DATABASE_PASSWORD=your_secure_password_here

# JWT
JWT_SECRET=your-secret-key

# CORS
CORS_ORIGIN=*

# Logging
LOG_LEVEL=debug
LOG_FORMAT=dev
```

## Middleware System

The template uses a priority-based middleware system. Each middleware has a priority level that determines its execution order:

### Priority Levels
- 1: Security & Logging (First)
- 2: Validation
- 3: Authentication
- 100: Error Handler (Last)

### Base Middleware
- Factory pattern for creating middleware
- Configurable priority and enabled state
- Consistent middleware structure

### Logger
- Request logging with Morgan
- Environment-aware logging format
- Development: Detailed logs
- Production: Minimal logs

### Error Handler
- Centralized error handling
- Environment-aware error messages
- Proper error status codes
- Stack traces in development

### Validator
- Request validation using express-validator
- Clear error messages
- Async validation support
- Custom validation rules

### Auth
- JWT token verification
- Simple token extraction
- User data attachment
- Secure token handling

### Security
- Basic security headers with Helmet
- CORS configuration
- Rate limiting
- Request sanitization

## Usage Examples

### Basic Route with Auth
```javascript
const { auth } = require('../middleware/auth');
const { validator } = require('../middleware/validator');

router.get('/protected', auth.fn, (req, res) => {
  res.json({ user: req.user });
});
```

### Route with Validation
```javascript
const { validator } = require('../middleware/validator');
const { body } = require('express-validator');

router.post('/users',
  validator.fn([
    body('email').isEmail(),
    body('password').isLength({ min: 6 })
  ]),
  (req, res) => {
    // Handle valid request
  }
);
```

### Custom Middleware
```javascript
const createMiddleware = require('./base');

const customMiddleware = createMiddleware((req, res, next) => {
  // Your middleware logic
  next();
}, { priority: 2 });
```

## Development

- Start development server: `npm run dev`
- Run tests: `npm test`
- Lint code: `npm run lint`
- Format code: `npm run format`

## Security Features

- JWT for authentication
- Helmet for security headers
- Rate limiting for API protection
- CORS configuration
- Environment variable protection
- Request validation
- Error sanitization
- Secure password handling

## Best Practices

- Use environment variables for configuration
- Keep middleware simple and focused
- Use proper error handling
- Implement request validation
- Follow REST API conventions
- Use async/await for asynchronous operations
- Implement proper logging
- Use middleware priorities correctly
- Keep security in mind
- Write clean, maintainable code

## Error Handling

The template includes a centralized error handling system:

```javascript
// Custom error
class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Usage
throw new AppError('Resource not found', 404);
```

## Database

- MongoDB with Mongoose
- Connection pooling
- Health checks
- Error handling
- Environment-based configuration

## License

ISC