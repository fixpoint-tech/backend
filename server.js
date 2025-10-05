import 'dotenv/config';
import express from 'express';
import { initializeDatabase, initializeStorage } from './src/services/connectionService.js';
import healthRoutes from './src/routes/health.js';

const app = express();

// Routes
app.use('/api/health', healthRoutes);

// Basic route
app.get('/api/', (req, res) => {
  res.json({ 
    message: 'FixPoint API Server is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Initialize services and start server
async function startServer() {
  const PORT = process.env.PORT || 5000;
  
  try {
    console.log('Starting FixPoint Server...');
    
    // Initialize database connection
    console.log('Initializing database connection...');
    await initializeDatabase();
    
    // Initialize MinIO storage
    console.log('Initializing MinIO storage...');
    await initializeStorage();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Server URL: http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Database health: http://localhost:${PORT}/api/health/database`);
      console.log(`Storage health: http://localhost:${PORT}/api/health/storage`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();