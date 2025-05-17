# Node Template API 🚀

A lightweight yet flexible **Node.js backend boilerplate** that scales from weekend side‑project to production. It ships with a plug‑and‑play database factory (MongoDB, MySQL or Postgres), JWT‑based authentication and a clean, service‑oriented folder layout so your code stays readable as your team (and features) grow.

&nbsp;

## ✨ Features

| Domain | What you get |
| ------ | ------------ |
| **Server** | Express 4, Helmet, CORS, compression, cookie‑parser, Morgan logger, body‑parser, centralised error‑handler, rate‑limiter |
| **Auth** | Password + JWT login / signup, access & refresh tokens in HTTP‑only cookies, role‑based guards (`protectRoute`, `isAdmin`) |
| **Database** | Factory pattern connects to **MongoDB (Mongoose)**, **MySQL (mysql2/promise)** or **Postgres (pg)** – just set `DB_TYPE` |
| **Structure** | Clearly separated *routes → controllers → middleware*, plus reusable utils |
| **Dev‑XP** | Nodemon auto‑reload, dotenv config loader, coloured console banners |
| **Prod‑Ready** | Graceful shutdown, security headers, input sanitisation, environment‑driven config |

&nbsp;

## 📂 Folder Structure

```
NODE_TEMPLATE/
├── api/
│   ├── index.js          # Express app (exports instance)
│   └── server.js         # Bootstraps DB + starts HTTP server
├── config/
│   └── db.js             # Database factory connector
├── controllers/          # Business‑logic per resource
├── lib ▸ utils/          # Helper functions (e.g. generateToken)
├── middleware/           # Auth guards, error handler, etc.
├── models/               # Database schemas / ORMs
├── routes/               # Express route definitions
├── config.env            # Environment variables
├── .gitignore
├── package.json
└── README.md             # ← you’re here
```

&nbsp;

## 🚀 Quick Start

```bash
# 1) Install dependencies
npm install

# 2) Copy & edit env vars
cp config.env.example config.env
nano config.env            # or any editor

# 3) Run in dev mode (auto‑reload)
npm run dev

# or production
npm start
```

Open <http://localhost:5000> (or the port you set) and you should see the **API is running** message.

&nbsp;

## 🔧 Environment Variables (`config.env`)

| Key | Description | Example |
|-----|-------------|---------|


> **Tip :** only `DB_TYPE` + matching credentials are required – leave the others blank.

&nbsp;

## 🗺️ API Overview

| Route | Method | Description | Auth |
|-------|--------|-------------|------|


&nbsp;

## 🛠️ Scripts

| NPM Script | Purpose |
|------------|---------|
| `npm run dev` | Launch server with **nodemon** & auto‑reload |
| `npm start` | Launch server with Node (production) |
| `npm test` | _(placeholder)_ run unit tests |

&nbsp;

## 🤝 Contributing

Contributions are welcome! If you'd like to improve this template, feel free to fork the repository and submit a pull request.

### Steps to Contribute
1. Fork the repository.
2. Create a new branch: git checkout -b feature-name.
3. Make your changes and commit them: git commit -m 'Add feature'.
4. Push to the branch: git push origin feature-name.
5. Open a pull request.

Please keep changes focused; open an issue first for large proposals.

&nbsp;

## 📄 License

[ISC](https://opensource.org/licenses/ISC) © Abdullelah, 2025

---

> _Happy hacking — may your APIs always respond with **200 OK**!_