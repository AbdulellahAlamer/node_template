require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection
const connect = async () => {
  try {
    const connectionString = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);
    await mongoose.connect(connectionString);
    return { type: 'mongodb', isConnected: true };
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

// Health check
const checkHealth = async () => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    return {
      type: 'mongodb',
      status: isConnected ? 'connected' : 'disconnected'
    };
  } catch (error) {
    return { type: 'mongodb', status: 'error', error: error.message };
  }
};

module.exports = { connect, checkHealth };