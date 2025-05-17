const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../config.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const db = require('../config/db');

// Route handlers
const authRoutes = require('../routes/authRoutes');
const userRoutes = require('../routes/userRoutes');
const adminRoutes = require('../routes/adminRoutes');
const passwordRoutes = require('../routes/passwordRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ------- GLOBAL MIDDLEWARE -------
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);


// ------- HEALTH CHECK -------
app.get('/api/health', async (_req, res) => {
  const dbHealth = await db.checkHealth();
  res.status(200).json({
    status: 'success',
    env: process.env.NODE_ENV || 'development',
    db: dbHealth,
    timestamp: Date.now(),
  });
});

// ------- ROUTES -------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/password', passwordRoutes);

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot find ${req.originalUrl} on this server`,
  });
});

// Global error handler (fallback)
// If you have a dedicated errorHandler middleware, import and use it here instead.
app.use((err, _req, res, _next) => {
  console.error('[Global Error]', err);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

// ------- SERVER BOOTSTRAP -------
const start = async () => {
  try {
    await db.connect();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to the database', err);
    process.exit(1);
  }
};

if (require.main === module) start();

module.exports = app;
