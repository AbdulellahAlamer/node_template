require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { connect } = require('../config/db');

// Import middleware
const { logger } = require('../middleware/logger');
const { errorHandler } = require('../middleware/errorHandler');
const { auth } = require('../middleware/auth');
const { security } = require('../middleware/security');

// Import routes
const authRoutes = require('../routes/authRoutes');
const userRoutes = require('../routes/userRoutes');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Security and logging
app.use(security.fn);
app.use(logger.fn);

// Database connection
(async () => {
  try {
    await connect();
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
})();

// Health check
app.get('/health', async (req, res) => {
  try {
    const health = await require('../config/db').checkHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', auth.fn, userRoutes);

// Error handling
app.use(errorHandler.fn);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});