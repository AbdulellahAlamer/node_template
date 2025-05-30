# Node.js Backend Template

A minimal, secure, and reusable Node.js backend template with Express and MongoDB.

## Features

- Simple and reusable middleware system
- JWT authentication
- Request validation
- Error handling
- Logging
- Security middleware
- MongoDB integration
- Environment configuration

## Project Structure

```
.
├── api/
│   └── server.js
├── config/
│   └── db.js
├── middleware/
│   ├── auth.js
│   ├── base.js
│   ├── errorHandler.js
│   ├── logger.js
│   ├── security.js
│   └── validator.js
├── models/
├── routes/
├── utils/
│   └── jwtUtils.js
├── config.env
├── config.env.example
└── package.json
```

## Quick Start

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy config.env.example to config.env and update values
4. Start the server:
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

## Middleware

The template includes several reusable middleware components:

### Base Middleware
- Simple factory pattern for creating middleware
- Configurable priority and enabled state

### Logger
- Request logging with Morgan
- Environment-aware logging format

### Error Handler
- Centralized error handling
- Environment-aware error messages
- Proper error status codes

### Validator
- Request validation using express-validator
- Clear error messages
- Async validation support

### Auth
- JWT token verification
- Simple token extraction
- User data attachment

### Security
- Basic security headers with Helmet
- CORS configuration
- Rate limiting

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

## Development

- Start development server: `npm run dev`
- Run tests: `npm test`
- Lint code: `npm run lint`
- Format code: `npm run format`

## Security

- JWT for authentication
- Helmet for security headers
- Rate limiting for API protection
- CORS configuration
- Environment variable protection

## Best Practices

- Use environment variables for configuration
- Keep middleware simple and focused
- Use proper error handling
- Implement request validation
- Follow REST API conventions
- Use async/await for asynchronous operations
- Implement proper logging

## License

ISC