const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const config = require('../config/config');
const { connect, checkHealth } = require('../config/db');

// Import routes
const authRoutes = require('../routes/auth.routes');
const userRoutes = require('../routes/user.routes');

// Initialize app
const app = express();

// Security middleware
app.use(helmet(config.security.helmet));
app.use(cors(config.security.cors));

// Body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Rate limiting
const limiter = rateLimit(config.security.rateLimit);
app.use(`${config.app.apiPrefix}/`, limiter);

// Logging
app.use(morgan(config.logging.morgan));

// Health check
app.get('/health', async (req, res) => {
  try {
    const health = await checkHealth();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.app.environment,
      database: health
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      error: error.message 
    });
  }
});

// Routes
app.use(`${config.app.apiPrefix}/auth`, authRoutes);
app.use(`${config.app.apiPrefix}/users`, require('../middleware/protectRoute'), userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const status = err.status || 500;
  const message = config.app.isProduction ? 'An error occurred' : err.message;

  res.status(status).json({ 
    error: message,
    ...(config.errorHandling.showStack && { stack: err.stack })
  });
});

// Start server
const startServer = async () => {
  try {
    await connect();
    console.log('Database connected successfully');

    app.listen(config.app.port, () => {
      console.log(`Server running in ${config.app.environment} mode on port ${config.app.port}`);
      console.log(`API available at http://${config.app.host}:${config.app.port}${config.app.apiPrefix}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;