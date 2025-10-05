import databaseClient from '../config/db.js';
import minioClient from '../config/minio.js';

// Test database connection (for health checks)
export async function testDatabaseConnection() {
  try {
    const client = await databaseClient.connect();
    await client.query('SELECT 1');
    client.release();
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
    const client = await databaseClient.connect();
    await client.query('SELECT 1');
    client.release();
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