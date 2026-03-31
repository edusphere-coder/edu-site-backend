const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'edusphere_lms',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 10000,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize database
const initializeDatabase = async () => {
  let connection;
  try {
    // Connect without database to create it if needed
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
      allowPublicKeyRetrieval: true,
      connectTimeout: 10000,
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('Connected to MySQL server');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'db.schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await connection.query(schema);
    console.log('Database and tables initialized successfully');

    await connection.end();
  } catch (error) {
    console.error('Error initializing database:', error);
    if (connection) await connection.end();
    throw error;
  }
};

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection pool established');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error connecting to database:', error);
    return false;
  }
};

module.exports = {
  pool,
  initializeDatabase,
  testConnection
};
