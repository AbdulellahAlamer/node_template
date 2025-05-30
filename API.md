# API Documentation

This document provides detailed information about the API endpoints, request/response formats, and authentication requirements.

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Authentication Endpoints

#### Register User
- **POST** `/auth/register`
- **Description**: Register a new user
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "name": "John Doe"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "id": "user_id",
        "email": "user@example.com",
        "name": "John Doe"
      },
      "token": "jwt_token"
    }
  }
  ```

#### Login
- **POST** `/auth/login`
- **Description**: Authenticate user and get token
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "id": "user_id",
        "email": "user@example.com",
        "name": "John Doe"
      },
      "token": "jwt_token"
    }
  }
  ```

#### Get Current User
- **GET** `/auth/me`
- **Description**: Get current user profile
- **Headers**: Requires authentication
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "id": "user_id",
        "email": "user@example.com",
        "name": "John Doe"
      }
    }
  }
  ```

## User Management

### Get User Profile
- **GET** `/users/:id`
- **Description**: Get user profile by ID
- **Headers**: Requires authentication
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "id": "user_id",
        "email": "user@example.com",
        "name": "John Doe"
      }
    }
  }
  ```

### Update User Profile
- **PATCH** `/users/:id`
- **Description**: Update user profile
- **Headers**: Requires authentication
- **Request Body**:
  ```json
  {
    "name": "Updated Name",
    "email": "updated@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "id": "user_id",
        "email": "updated@example.com",
        "name": "Updated Name"
      }
    }
  }
  ```

## Error Responses

All error responses follow this format:

```json
{
  "status": "error",
  "message": "Error message",
  "errors": [
    {
      "field": "field_name",
      "message": "Validation error message"
    }
  ]
}
```

### Common Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- 100 requests per 15 minutes for authenticated users
- 50 requests per 15 minutes for unauthenticated users

## Security

- All endpoints use HTTPS in production
- Passwords are hashed using bcrypt
- JWT tokens expire after 24 hours
- CORS is enabled for specified origins
- Helmet security headers are enabled
- Rate limiting is enabled
- Request validation is enforced

## Best Practices

1. Always include the Authorization header for protected routes
2. Handle rate limiting by implementing exponential backoff
3. Validate request data before sending
4. Handle errors appropriately
5. Use proper HTTP methods for each operation
6. Follow REST conventions
7. Keep tokens secure and never expose them
8. Implement proper error handling
9. Use proper content types
10. Follow the response format 