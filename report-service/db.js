const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root', // Assuming default user is root
  password: 'pass',
  database: 'report_db'
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Test connection function
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};