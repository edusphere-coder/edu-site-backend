const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/*
====================================
MYSQL CONNECTION POOL
====================================
*/

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  enableKeepAlive: true,
  keepAliveInitialDelay: 0,

  connectTimeout: 10000
});

/*
====================================
INITIALIZE DATABASE (RUN SCHEMA)
====================================
*/

const initializeDatabase = async () => {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true,
      connectTimeout: 10000
    });

    console.log("✅ Connected to MySQL server");

    // Read schema file
    const schemaPath = path.join(__dirname, "db.schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Execute SQL
    await connection.query(schema);

    console.log("✅ Database and tables initialized successfully");

    await connection.end();

  } catch (error) {
    console.error("❌ Database initialization error:", error);
    if (connection) await connection.end();
    throw error;
  }
};

/*
====================================
TEST CONNECTION
====================================
*/

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL connection pool established");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Error connecting to database:", error);
    return false;
  }
};

/*
====================================
EXPORT MODULE
====================================
*/

module.exports = {
  pool,
  initializeDatabase,
  testConnection
};
