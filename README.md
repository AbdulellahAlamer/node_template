# Node Template API

A lightweight, security-focused Node.js/Express starter powered by MongoDB & JWT authentication.

---

## Features
- **Express 4** with async/await controllers
- **Mongoose** ODM with strict schemas
- **JWT Auth** (header *or* Http-Only cookie) & role-based access control
- Centralised **configuration** (`config.js`) with runtime validation
- Security hardening: **Helmet**, **CORS**, **rate-limiting**, **bcrypt** password hashing
- **Jest + Supertest** integration test example (`tests/auth.test.js`)
- Single-file boot (`server.js`) – deploy anywhere (Node, Docker, serverless)

---

## File tree (trunk)
\`\`\`
.
├── server.js                # App entrypoint
├── config.js                # Env-driven config loader/validator
├── db.js                    # Database connection helper
├── user.model.js            # Mongoose User schema
├── auth.controller.js       # Auth endpoints logic
├── user.controller.js       # User endpoints logic
├── auth.routes.js           # /auth/* routes
├── user.routes.js           # /users/* routes
├── protectRoute.js          # JWT auth guard middleware
├── adminAuth.js             # Admin-role guard middleware
├── isAdmin.js               # Simple role checker
├── services/
│   ├── auth.service.js
│   └── user.service.js
├── tests/
│   └── auth.test.js         # Integration test suite
├── API.md                   # Full REST reference
├── package.json
└── config.env               # Environment variables
\`\`\`

*(An optional \`index.js\` wrapper may exist for serverless platforms such as Vercel.)*

---

## Quick start
\`\`\`bash
# 1. Install deps
npm install

# 2. Copy & edit env vars
cp config.env.example config.env

# 3. Run in watch mode (nodemon)
npm run dev
# or start normally
npm start
\`\`\`

By default the server listens on **http://localhost:5000** and exposes its API under \`/api\` (configurable via \`API_PREFIX\`).

---

## Environment variables (excerpt)
| Key | Example | Notes |
|-----|---------|-------|
| \`NODE_ENV\` | \`development\` | \`production\` disables verbose errors |
| \`PORT\` | \`5000\` | Listening port |
| \`API_PREFIX\` | \`/api\` | Root path for all REST routes |
| \`DATABASE\` | \`mongodb://localhost:27017/node_template\` | MongoDB connection URI (use \`<password>\` placeholder for Atlas) |
| \`DATABASE_PASSWORD\` | \`s3cur3Pass!\` | Substitutes \`<password>\` in \`DATABASE\` |
| \`JWT_SECRET\` | *32+ random chars* | **Required** in production |
| \`JWT_EXPIRES_IN\` | \`24h\` | Token lifetime |
| \`CORS_ORIGIN\` | \`http://localhost:3000\` | Accepts comma-separated list or \`*\` |

See **config.env.example** for the full list.

---

## Scripts
| Command | What it does |
|---------|--------------|
| \`npm run dev\` | Start with **nodemon** (auto-reload) |
| \`npm start\`   | Start once (production) |
| \`npm test\`    | Run Jest tests |
| \`npm run test:watch\` | Watch mode |
| \`npm run test:coverage\` | Generate coverage report |
| \`npm run lint\` | ESLint code quality |
| \`npm run format\` | Format with Prettier |

---

## Testing
Tests live inside **tests/** and use an in-memory Mongo instance (or the URI defined in \`DATABASE_TEST\`).
Run all tests:
\`\`\`bash
npm test
\`\`\`

---

## API docs
The full REST contract (endpoints, payloads, examples) is kept in [API.md](API.md).

---

## License
ISC © 2025 Abdulellah
