const mysql = require("mysql2/promise");
require("dotenv").config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "test_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully!");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
}

// Initialize database with sample table
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();

    // Create users table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        age INT,
        profile_photo_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    await connection.execute(createTableQuery);
    console.log("✅ Database table initialized successfully!");

    // Add profile_photo_url column if it doesn't exist (for existing tables)
    await addProfilePhotoColumn(connection);

    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    return false;
  }
}

// Add profile_photo_url column to existing tables
async function addProfilePhotoColumn(connection) {
  try {
    // Check if profile_photo_url column exists
    const [columns] = await connection.execute(
      `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'profile_photo_url'
    `,
      [process.env.DB_NAME || "test_db"]
    );

    if (columns.length === 0) {
      // Column doesn't exist, add it
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN profile_photo_url VARCHAR(500) AFTER age
      `);
      console.log("✅ Added profile_photo_url column to existing table!");
    } else {
      console.log("✅ profile_photo_url column already exists!");
    }
  } catch (error) {
    console.error("❌ Failed to add profile_photo_url column:", error.message);
  }
}

module.exports = {
  pool,
  testConnection,
  initializeDatabase,
};
