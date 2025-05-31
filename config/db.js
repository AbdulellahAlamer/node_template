const mongoose = require('mongoose');
const config = require('./config');

// MongoDB connection
const connect = async () => {
  try {
    let connectionString = config.db.uri;
    
    // Handle password replacement for MongoDB Atlas or authenticated connections
    if (connectionString.includes('<password>')) {
      connectionString = connectionString.replace('<password>', config.db.password);
    }
    
    await mongoose.connect(connectionString, config.db.options);
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
      status: isConnected ? 'connected' : 'disconnected',
      details: {
        host: config.db.uri.split('@')[1]?.split('/')[0] || 'localhost',
        database: config.db.uri.split('/').pop()?.split('?')[0] || 'node_template'
      }
    };
  } catch (error) {
    return { 
      type: 'mongodb', 
      status: 'error', 
      error: error.message 
    };
  }
};

module.exports = { connect, checkHealth };