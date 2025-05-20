const db = require('../config/db');

// This works with the MongoDB connector option from db.js
// If using other databases, this would need to be modified
const createUserModel = async () => {
  try {
    const connection = await db.connect();
    
    // For MongoDB
    if (connection.type === 'mongodb') {
      const mongoose = connection.client;
      
      const userSchema = new mongoose.Schema({
        username: { 
          type: String, 
          required: true, 
          unique: true 
        },
        password: { 
          type: String, 
          required: true 
        },
        email: {
          type: String,
          required: true,
          unique: true
        },
        status: {
          type: String,
          default: 'Active'
        },
        role: {
          type: String,
          enum: ['user', 'admin'],
          default: 'user'
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      });
      
      // Don't recreate model if it already exists
      return mongoose.models.User || mongoose.model('User', userSchema);
    }
    
    // For MySQL
    else if (connection.type === 'mysql') {
      // Would define table schema and return query methods
      // This is a simplified example
      const pool = connection.client;
      
      // Create table if it doesn't exist
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          status VARCHAR(50) DEFAULT 'Active',
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Return an object with methods to interact with the users table
      return {
        findById: async (id) => {
          const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
          return rows[0];
        },
        findByUsername: async (username) => {
          const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
          return rows[0];
        },
        create: async (userData) => {
          const { username, password, email, status, role } = userData;
          const [result] = await pool.query(
            'INSERT INTO users (username, password, email, status, role) VALUES (?, ?, ?, ?, ?)',
            [username, password, email, status || 'Active', role || 'user']
          );
          return { id: result.insertId, ...userData };
        }
        // Add other methods as needed
      };
    }
    
    // For PostgreSQL
    else if (connection.type === 'postgres') {
      // Similar implementation to MySQL with PostgreSQL syntax
      const pool = connection.client;
      
      // Create table if it doesn't exist
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          status VARCHAR(50) DEFAULT 'Active',
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Return an object with methods to interact with the users table
      return {
        findById: async (id) => {
          const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
          return result.rows[0];
        },
        findByUsername: async (username) => {
          const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
          return result.rows[0];
        },
        create: async (userData) => {
          const { username, password, email, status, role } = userData;
          const result = await pool.query(
            'INSERT INTO users (username, password, email, status, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [username, password, email, status || 'Active', role || 'user']
          );
          return result.rows[0];
        }
        // Add other methods as needed
      };
    }
    
    else {
      throw new Error(`Database type ${connection.type} not supported by User model`);
    }
  } catch (error) {
    console.error('Error creating User model:', error);
    throw error;
  }
};

module.exports = createUserModel();