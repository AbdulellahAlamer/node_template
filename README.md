# Node.js Backend Template

A minimal, secure, and reusable Node.js backend template with Express and MongoDB. This template provides a solid foundation for building scalable APIs with best practices and security in mind.

## Features

- JWT authentication with secure token handling
- Request validation
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
│   └── auth.js           # Authentication middleware
├── models/               # Database models
├── routes/              # API routes
├── services/            # Business logic
├── utils/
│   └── jwtUtils.js      # JWT utilities
├── tests/               # Test files
├── config.env           # Environment variables
├── config.env.example   # Example environment variables
├── API.md              # API documentation
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

## Authentication

The template uses JWT (JSON Web Tokens) for authentication:

- Token-based authentication
- Secure token verification
- Role-based access control
- Password hashing with bcrypt
- Token expiration handling

## Security Features

- JWT for authentication
- Helmet for security headers
- Rate limiting for API protection
- CORS configuration
- Environment variable protection
- Request validation
- Error sanitization
- Secure password handling

## Development

- Start development server: `npm run dev`
- Run tests: `npm test`
- Run tests with coverage: `npm run test:coverage`
- Watch tests: `npm run test:watch`
- Lint code: `npm run lint`
- Format code: `npm run format`

## Testing

The project uses Jest for testing. Test files are located in the `tests` directory:

- Unit tests for utilities
- Integration tests for API endpoints
- Authentication tests
- Error handling tests

## Best Practices

- Use environment variables for configuration
- Keep middleware simple and focused
- Use proper error handling
- Implement request validation
- Follow REST API conventions
- Use async/await for asynchronous operations
- Implement proper logging
- Keep security in mind
- Write clean, maintainable code

## API Documentation

Detailed API documentation is available in [API.md](API.md), including:

- Authentication endpoints
- User management endpoints
- Request/response formats
- Error responses
- Authentication requirements

## Error Handling

The template includes a centralized error handling system:

- Environment-aware error messages
- Proper error status codes
- Stack traces in development
- Consistent error response format
- Validation error handling
- Authentication error handling
- Database error handling

## License

ISC