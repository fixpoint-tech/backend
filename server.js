import 'dotenv/config';
import express from 'express';
import http from "http";
import { initializeDatabase, initializeStorage } from './src/services/connectionService.js';
import healthRoutes from './src/routes/health.js';
import { setupSocket } from './src/socket/socket.js';
import issueRoutes from './src/routes/issues.js';
import userRoutes from './src/routes/users.js';
import branchRoutes from './src/routes/branch.js';

const app = express();
const server = http.createServer(app);


//Socket.io
setupSocket(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRoutes);

app.use('/api/v1/issues', issueRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/branches', branchRoutes);

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
    server.listen(PORT, () => {
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