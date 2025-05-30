require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection configuration
const connect = async () => {
  try {
    const connectionString = process.env.MONGODB_URI || 
      `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
    
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB successfully');
    return {
      type: 'mongodb',
      client: mongoose,
      isConnected: mongoose.connection.readyState === 1
    };
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

// Health check function
const checkHealth = async () => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    return {
      type: 'mongodb',
      status: isConnected ? 'connected' : 'disconnected',
      details: {
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        database: mongoose.connection.name
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

module.exports = {
  connect,
  checkHealth
};