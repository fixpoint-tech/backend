import { 
  testDatabaseConnection, 
  checkMinioConnection 
} from '../services/connectionService.js';

/**
 * Overall health check - tests all services
 */
export const getOverallHealth = async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check database connection
    const dbHealth = await testDatabaseConnection();
    
    // Check MinIO connection
    const storageHealth = await checkMinioConnection();
    
    const responseTime = Date.now() - startTime;
    const isHealthy = dbHealth.connected && storageHealth.connected;
    
    const healthStatus = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      services: {
        database: {
          status: dbHealth.connected ? 'up' : 'down',
          error: dbHealth.error
        },
        storage: {
          status: storageHealth.connected ? 'up' : 'down',
          error: storageHealth.error
        }
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: `${Math.floor(process.uptime())}s`,
        memoryUsage: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
        }
      }
    };
    
    res.status(isHealthy ? 200 : 503).json(healthStatus);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Database-specific health check
 */
export const getDatabaseHealth = async (req, res) => {
  try {
    const startTime = Date.now();
    const dbHealth = await testDatabaseConnection();
    const responseTime = Date.now() - startTime;
    
    const response = {
      service: 'database',
      status: dbHealth.connected ? 'healthy' : 'unhealthy',
      connected: dbHealth.connected,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      error: dbHealth.error,
      details: {
        type: 'PostgreSQL',
        port: process.env.POSTGRES_PORT || 5432,
        database: process.env.POSTGRES_DB
      }
    };
    
    res.status(dbHealth.connected ? 200 : 503).json(response);
  } catch (error) {
    res.status(500).json({
      service: 'database',
      status: 'error',
      message: 'Database health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * MinIO storage-specific health check
 */
export const getStorageHealth = async (req, res) => {
  try {
    const startTime = Date.now();
    const storageHealth = await checkMinioConnection();
    const responseTime = Date.now() - startTime;
    
    const response = {
      service: 'storage',
      status: storageHealth.connected ? 'healthy' : 'unhealthy',
      connected: storageHealth.connected,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      error: storageHealth.error,
      details: {
        type: 'MinIO S3',
        port: process.env.MINIO_PORT || 9000,
        consolePort: process.env.MINIO_CONSOLE_PORT || 9001
      }
    };
    
    res.status(storageHealth.connected ? 200 : 503).json(response);
  } catch (error) {
    res.status(500).json({
      service: 'storage',
      status: 'error',
      message: 'Storage health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Readiness probe - checks if the service is ready to accept traffic
 */
export const getReadinessCheck = async (req, res) => {
  try {
    const dbHealth = await testDatabaseConnection();
    const storageHealth = await checkMinioConnection();
    
    const isReady = dbHealth.connected && storageHealth.connected;
    
    if (isReady) {
      res.status(200).json({
        status: 'ready',
        message: 'Service is ready to accept traffic',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        message: 'Service is not ready to accept traffic',
        timestamp: new Date().toISOString(),
        reasons: {
          database: dbHealth.connected ? 'ready' : dbHealth.error,
          storage: storageHealth.connected ? 'ready' : storageHealth.error
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Readiness check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Liveness probe - checks if the service is alive
 */
export const getLivenessCheck = (req, res) => {
  res.status(200).json({
    status: 'alive',
    message: 'Service is alive',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`
  });
};