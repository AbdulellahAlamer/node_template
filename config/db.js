require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection
const connect = async () => {
  try {
    let connectionString = process.env.DATABASE;
    
    // Handle password replacement for MongoDB Atlas or authenticated connections
    if (connectionString.includes('<password>')) {
      const password = process.env.DATABASE_PASSWORD || '';
      connectionString = connectionString.replace('<password>', password);
    }
    
    // MongoDB connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    
    await mongoose.connect(connectionString, options);
    console.log(`MongoDB connected: ${connectionString.split('@')[0]}@***`);
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