import 'dotenv/config';
import express from 'express';
import http from "http";
import cors from 'cors';
import { initializeDatabase, initializeStorage } from './src/services/connectionService.js';
import healthRoutes from './src/routes/health.js';
import { setupSocket } from './src/socket/socket.js';
import issueRoutes from './src/routes/issues.js';
import userRoutes from './src/routes/users.js';
import messageRoutes from './src/routes/messages.js';
import branchRoutes from './src/routes/branch.js';
import thirdPartiesRoutes from './src/routes/thirdparties.js';
import cashRequestRoutes from './src/routes/cashRequestRoutes.js';
import ahpRoutes from './src/routes/ahpRoutes.js';
import authRoutes from './src/routes/auth.js';
import outsidePartyRequestRoutes from './src/routes/outsidePartyRequests.js';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({ origin: '*' }));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/cash-requests', cashRequestRoutes);
app.use('/api/v1/issues', issueRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/branches', branchRoutes);
app.use('/api/v1/thirdparties', thirdPartiesRoutes);
app.use('/api/v1/ahp', ahpRoutes);
app.use('/api/v1/outside-party-requests', outsidePartyRequestRoutes);

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

    //Socket.io
    await setupSocket(server);

    // Start server
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