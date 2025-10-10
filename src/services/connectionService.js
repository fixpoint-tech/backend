import { Sequelize } from 'sequelize';
import minioClient from '../config/minio.js';
import dotenv from 'dotenv';
import { createRequire } from 'module';

// Load environment variables
dotenv.config();

// Create require function for CommonJS modules in ES module
const require = createRequire(import.meta.url);

// Import database configuration
const config = require('../config/database.cjs');
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Create Sequelize instance using database.cjs config
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);

// Test database connection (for health checks)
export async function testDatabaseConnection() {
  try {
    await sequelize.authenticate();
    return { connected: true, error: null };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

// Check MinIO connection (for health checks)
export async function checkMinioConnection() {
  try {
    await minioClient.listBuckets();
    return { connected: true, error: null };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

// Initialize database
export async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    
    // Sync database (optional - creates tables if they don't exist)
    // await sequelize.sync(); // Uncomment if you want to auto-create tables
    
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    throw error;
  }
}

// Initialize MinIO storage
export async function initializeStorage() {
  try {
    await minioClient.listBuckets();
    console.log('MinIO storage initialized successfully');
    return true;
  } catch (error) {
    console.error('MinIO storage initialization failed:', error.message);
    throw error;
  }
}

// Test Sequelize connection with detailed info
export async function testSequelizeConnection() {
  try {
    const startTime = Date.now();
    await sequelize.authenticate();
    const connectionTime = Date.now() - startTime;
    
    // Get database info
    const [results] = await sequelize.query('SELECT version() as version, current_database() as database');
    const dbInfo = results[0];
    
    return {
      connected: true,
      connectionTime,
      database: dbInfo.database,
      version: dbInfo.version,
      error: null
    };
  } catch (error) {
    return {
      connected: false,
      connectionTime: null,
      database: null,
      version: null,
      error: error.message
    };
  }
}

// Close database connection gracefully
export async function closeDatabaseConnection() {
  try {
    await sequelize.close();
    console.log('Database connection closed successfully');
    return true;
  } catch (error) {
    console.error('Failed to close database connection:', error.message);
    return false;
  }
}

// Get Sequelize instance (for use in other parts of the app)
export function getSequelizeInstance() {
  return sequelize;
}