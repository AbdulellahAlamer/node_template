require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { connect } = require('../config/db');
const errorHandler = require('../middleware/errorHandler');
const authRoutes = require('../routes/authRoutes');
const userRoutes = require('../routes/userRoutes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Connect to database
(async () => {
  try {
    const db = await connect();
    console.log(`Connected to ${db.type} database successfully`);
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    process.exit(1);
  }
})();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const health = await require('../config/db').checkHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Error handling middleware (should be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});