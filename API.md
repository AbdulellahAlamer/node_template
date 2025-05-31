# API Documentation

Base URL: `http://localhost:5000/api` (configurable via API_PREFIX)

## Authentication

All protected endpoints require a valid JWT token in either:
- Authorization header: `Authorization: Bearer <token>`
- HttpOnly cookie: `jwt=<token>`

**Token Details:**
- Contains user ID, username, email, and role
- Includes issued at (iat) timestamp
- Validates issuer and audience
- Configurable expiration (JWT_EXPIRES_IN)
- Cookie expiration (JWT_COOKIE_EXPIRES_IN)
- Supports token refresh
- Encrypted payload

**Password Requirements:**
- Minimum length: 6 (configurable via PASSWORD_MIN_LENGTH)
- Maximum length: 128 (configurable via PASSWORD_MAX_LENGTH)
- Optional uppercase requirement (PASSWORD_REQUIRE_UPPERCASE)
- Optional lowercase requirement (PASSWORD_REQUIRE_LOWERCASE)
- Optional numbers requirement (PASSWORD_REQUIRE_NUMBERS)
- Optional special chars requirement (PASSWORD_REQUIRE_SPECIAL)

**Username Requirements:**
- Minimum length: 3 (configurable via USERNAME_MIN_LENGTH)
- Maximum length: 30 (configurable via USERNAME_MAX_LENGTH)
- Allowed characters: alphanumeric (configurable via USERNAME_ALLOWED_CHARS)

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation Rules:**
- username: required, 3-30 chars, unique, alphanumeric
- email: required, valid format, unique
- password: required, min 6 chars

**Response:** `201 Created`
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "status": "active",
      "createdAt": "2025-01-31T12:00:00.000Z"
    }
  }
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "jwt_token",
    "user": {
      "id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "status": "active",
      "lastLogin": "2025-01-31T12:00:00.000Z"
    }
  }
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

**Notes:**
- Clears JWT cookie if using cookie-based auth
- Invalidates current session
- Client should remove stored token
- Updates last activity timestamp

### Refresh Token
```http
POST /auth/refresh
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "data": {
    "token": "new_jwt_token",
    "user": {
      "id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

**Notes:**
- Extends session lifetime
- Returns fresh token
- Validates current token before refresh
- Updates last activity timestamp
- Preserves original token claims
- Merges updated user data
- Validates issuer and audience

### Change Password
```http
POST /auth/change-password
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Validation Rules:**
- currentPassword: required
- newPassword: required, min 6 chars
- confirmPassword: must match newPassword

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Password changed successfully"
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "status": "active",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "url",
        "bio": "text"
      },
      "lastLogin": "2025-01-31T12:00:00.000Z",
      "createdAt": "2025-01-31T12:00:00.000Z",
      "updatedAt": "2025-01-31T12:00:00.000Z"
    }
  }
}
```

## User Management

All endpoints require authentication. Admin-only endpoints require role="admin".

### List Users (Admin only)
```http
GET /users
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": "user_id",
        "username": "username",
        "email": "email",
        "role": "role",
        "status": "status",
        "profile": {
          "firstName": "string",
          "lastName": "string"
        },
        "lastLogin": "date"
      }
    ]
  }
}
```

### Get User
```http
GET /users/:id
Authorization: Bearer <token>
```

**Access Rules:**
- Users can only access their own profile
- Admins can access any profile

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user_id",
      "username": "username",
      "email": "email",
      "role": "role",
      "status": "status",
      "profile": {
        "firstName": "string",
        "lastName": "string",
        "avatar": "string",
        "bio": "string"
      }
    }
  }
}
```

### Update User
```http
PUT /users/:id
Authorization: Bearer <token>
```

**Access Rules:**
- Users can only update their own profile
- Admins can update any profile
- Cannot update username/password through this endpoint

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "url",
    "bio": "text"
  }
}
```

**Protected Fields:**
- username
- password
- role
- status

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user_id",
      "username": "username",
      "email": "newemail@example.com",
      "role": "role",
      "status": "status",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "url",
        "bio": "text"
      }
    }
  }
}
```

### Partial Update User
```http
PATCH /users/:id
Authorization: Bearer <token>
```

**Notes:**
- Same rules and response format as PUT
- Allows partial updates
- Only specified fields are modified
- Same field protections apply

### Update User Role (Admin only)
```http
PATCH /users/:id/role
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "role": "admin"
}
```

**Validation Rules:**
- role: required, enum: ["user", "admin"]

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user_id",
      "role": "admin"
    }
  }
}
```

### Update User Status (Admin only)
```http
PATCH /users/:id/status
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "inactive"
}
```

**Validation Rules:**
- status: required, enum: ["active", "inactive", "suspended"]

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user_id",
      "status": "inactive"
    }
  }
}
```

### Delete User
```http
DELETE /users/:id
Authorization: Bearer <token>
```

**Access Rules:**
- Users can only delete their own profile
- Admins can delete any profile

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "User deleted successfully"
}
```

## Error Responses

All errors follow this format:
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation message"
    }
  ]
}
```

### Status Codes
- 400 - Bad Request (validation failed)
- 401 - Unauthorized (invalid/missing token)
- 403 - Forbidden (insufficient permissions)
- 404 - Not Found
- 409 - Conflict (duplicate unique field)
- 422 - Unprocessable Entity
- 429 - Too Many Requests
- 500 - Internal Server Error

### Common Error Types
1. **Validation Errors** (400)
   - Missing required fields
   - Invalid field format
   - Password too short/long
   - Invalid email format
   - Username format invalid
   - Password requirements not met
   - Username requirements not met

2. **Authentication Errors** (401)
   - Invalid token
   - Expired token
   - Invalid credentials
   - Account inactive
   - Invalid issuer/audience
   - Token not yet active
   - Token manipulation detected
   - Cookie validation failed

3. **Authorization Errors** (403)
   - Insufficient permissions
   - Wrong role
   - Account suspended
   - IP address blocked
   - Rate limit exceeded

4. **Conflict Errors** (409)
   - Duplicate email
   - Duplicate username

## Rate Limiting

Default configuration (configurable):
- Window: 15 minutes (RATE_LIMIT_WINDOW_MS=900000)
- Max requests: 100 per window (RATE_LIMIT_MAX=100)
- Tracking: Per IP address
- Proxy support: Configurable (TRUST_PROXY)

Exceeded limit response (429 Too Many Requests):
```json
{
  "status": "error",
  "message": "Too many requests, please try again later",
  "retryAfter": 900 // seconds until reset
}
```

## Logging

Configurable logging options:
- Level: debug/info/warn/error (LOG_LEVEL)
- Format: dev/combined/common (LOG_FORMAT)
- File logging: optional (LOG_TO_FILE)
- File path: configurable (LOG_FILE_PATH)
- File rotation: size based (LOG_MAX_SIZE)
- Max files: configurable (LOG_MAX_FILES)

## Health Check

```http
GET /health
```

**Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2025-01-31T12:00:00.000Z",
  "environment": "development",
  "version": "1.0.0",
  "uptime": 3600,
  "database": {
    "status": "connected",
    "latency": "50ms",
    "type": "mongodb",
    "host": "localhost:27017",
    "name": "node_template",
    "poolSize": 10,
    "connections": {
      "active": 5,
      "available": 5
    }
  },
  "memory": {
    "used": 50,
    "total": 512,
    "unit": "MB"
  },
  "logging": {
    "level": "debug",
    "format": "dev",
    "toFile": false
  }
}
```

## Security Notes

1. All endpoints use HTTPS in production
2. JWT tokens expire after 24 hours
3. Passwords are hashed using bcrypt (cost factor: 12)
4. Rate limiting prevents brute force attacks
5. Error messages are sanitized in production
6. Request size is limited to 10MB
7. CORS is configured per environment
8. Sensitive fields are protected
9. Account status is checked on every request
10. Last login is tracked for security monitoring
11. Token refresh mechanism available
12. Secure cookie handling in development/production
13. Token issuer/audience validation
14. Database connection string encryption
15. MongoDB connection pooling
16. Token payload validation
17. Token debugging disabled in production
18. Configurable password requirements
19. Username validation rules
20. IP-based rate limiting
21. Proxy trust configuration
22. Detailed error tracking
23. Request logging options
24. Development mode safeguards