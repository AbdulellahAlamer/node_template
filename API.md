# REST API Reference

> Base URL (local dev): **http://localhost:5000/api**

All protected routes expect a JWT in the `Authorization` header using the **Bearer** scheme:

```
Authorization: Bearer <token>
```

---

## Authentication

### Register
|                     |                          |
|---------------------|--------------------------|
| **Method & Path**   | `POST /auth/register` |
| **Auth Required**   | No                       |
| **Description**     | Create a new user account |

#### Request Body
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Response `201 Created`
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "65c2ab849bf42e219e20ff31",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "status": "active"
    }
  }
}
```

### Login
|                     |                          |
|---------------------|--------------------------|
| **Method & Path**   | `POST /auth/login` |
| **Auth Required**   | No                       |
| **Description**     | Authenticate a user and obtain a token |

#### Request Body
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Response `200 OK`
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "<jwt_token>",
    "user": {
      "id": "65c2ab849bf42e219e20ff31",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "status": "active"
    }
  }
}
```

### Get Current User
|                     |                          |
|---------------------|--------------------------|
| **Method & Path**   | `GET /auth/me` |
| **Auth Required**   | Yes                      |
| **Description**     | Retrieve the authenticated user's profile |

#### Response `200 OK`
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "65c2ab849bf42e219e20ff31",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "status": "active",
      "createdAt": "2025-05-31T12:00:00.000Z",
      "updatedAt": "2025-05-31T12:00:00.000Z"
    }
  }
}
```

---

## Users
All routes below are **protected** and require authentication; endpoints marked *Admin only* also require the authenticated user to have the role `admin`.

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/users` | List all users <br>*Admin only* |
| `GET`  | `/users/:id` | Get user by ID |
| `PUT`  | `/users/:id` | Replace user document |
| `PATCH`| `/users/:id` | Update (partial) user document |
| `DELETE` | `/users/:id` | Delete user |

#### Example — Get User by ID
`GET /users/65c2ab849bf42e219e20ff31`
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "65c2ab849bf42e219e20ff31",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "status": "active"
    }
  }
}
```

---

## Error format
All errors follow the structure below. The `errors` array is included only when the error relates to field-level validation.

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Email already exists" }
  ]
}
```

### Common status codes
- **400** – Bad request / validation
- **401** – Unauthorized (missing or invalid token)
- **403** – Forbidden (insufficient permissions)
- **404** – Resource not found
- **409** – Conflict (duplicate key)
- **500** – Internal server error

---

## Rate limiting & security
- Global rate limit: **100 requests / 15 min** per IP (adjustable in `config.js`).
- Helmet & CORS are enabled with sane defaults.
- Tokens expire after 24 h.
- All passwords are hashed with bcrypt (configurable salt rounds).

---