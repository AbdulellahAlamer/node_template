require('dotenv').config();

// Database factory pattern
const databaseConnectors = {
  mongodb: async () => {
    const mongoose = require('mongoose');
    const connectionString = process.env.MONGODB_URI || 
      `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
    
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    return {
      type: 'mongodb',
      client: mongoose,
      isConnected: mongoose.connection.readyState === 1
    };
  },
  
  mysql: async () => {
    const mysql = require('mysql2/promise');
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10
    });
    
    // Test connection
    await pool.getConnection();

    return {
      type: 'mysql',
      client: pool,
      isConnected: true
    };
  },
  
  postgres: async () => {
    const { Pool } = require('pg');
    const pool = new Pool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 5432
    });
    
    // Test connection
    await pool.query('SELECT NOW()');
    
    return {
      type: 'postgres',
      client: pool,
      isConnected: true
    };
  }
};

// Choose database type from environment variable
const dbType = process.env.DB_TYPE || 'mongodb';

// Export the database connection function
module.exports = {
  connect: async () => {
    if (!databaseConnectors[dbType]) {
      throw new Error(`Unsupported database type: ${dbType}`);
    }
    
    try {
      const db = await databaseConnectors[dbType]();
      console.log(`Connected to ${db.type} database`);
      return db;
    } catch (error) {
      console.error(`Database connection error: ${error.message}`);
      throw error;
    }
  },
  
  checkHealth: async () => {
    try {
      const db = await databaseConnectors[dbType]();
      return {
        type: db.type,
        status: 'connected'
      };
    } catch (error) {
      return {
        type: dbType,
        status: 'disconnected',
        error: error.message
      };
    }
  }
};