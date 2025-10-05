import request from 'supertest';
import express from 'express';
import healthRoutes from '../routes/health.js';

// Custom matcher for Jest
expect.extend({
  toBeOneOf(received, expected) {
    const pass = expected.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${expected}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${expected}`,
        pass: false,
      };
    }
  },
});

describe('Health Routes - Proper Health Status Validation', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/health', healthRoutes);
  });

  test('GET /api/health should validate actual service health, not just response', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect('Content-Type', /json/);
    
    // Should return 200 if healthy, 503 if unhealthy, 500 if error
    expect(response.status).toBeOneOf([200, 503, 500]);
    
    // Basic structure validation
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
    
    if (response.status !== 500) {
      // Validate the status matches the HTTP code
      expect(response.body.status).toBeOneOf(['healthy', 'unhealthy']);
      expect(response.body).toHaveProperty('services');
      
      // Validate services object structure
      expect(response.body.services).toHaveProperty('database');
      expect(response.body.services).toHaveProperty('storage');
      
      // Validate database service status
      expect(response.body.services.database).toHaveProperty('status');
      expect(response.body.services.database.status).toBeOneOf(['up', 'down']);
      
      // Validate storage service status  
      expect(response.body.services.storage).toHaveProperty('status');
      expect(response.body.services.storage.status).toBeOneOf(['up', 'down']);
      
      // CRITICAL: Validate that HTTP status matches actual health
      if (response.status === 200) {
        expect(response.body.status).toBe('healthy');
        expect(response.body.services.database.status).toBe('up');
        expect(response.body.services.storage.status).toBe('up');
      }
      
      if (response.status === 503) {
        expect(response.body.status).toBe('unhealthy');
        // At least one service should be down
        const dbDown = response.body.services.database.status === 'down';
        const storageDown = response.body.services.storage.status === 'down';
        expect(dbDown || storageDown).toBeTruthy();
      }
    }
  });

  test('GET /api/health/database should verify actual database connection status', async () => {
    const response = await request(app)
      .get('/api/health/database')
      .expect('Content-Type', /json/);
    
    expect(response.status).toBeOneOf([200, 503, 500]);
    expect(response.body).toHaveProperty('service', 'database');
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
    
    if (response.status !== 500) {
      expect(response.body).toHaveProperty('connected');
      expect(typeof response.body.connected).toBe('boolean');
      expect(response.body).toHaveProperty('responseTime');
      
      // CRITICAL: Validate that HTTP status matches actual connection
      if (response.body.connected === true) {
        expect(response.body.status).toBe('healthy');
        expect(response.status).toBe(200);
      } else {
        expect(response.body.status).toBe('unhealthy');
        expect(response.status).toBe(503);
        expect(response.body).toHaveProperty('error');
      }
      
      // Validate response time is reasonable
      const responseTimeMatch = response.body.responseTime.match(/(\d+)ms/);
      if (responseTimeMatch) {
        const timeMs = parseInt(responseTimeMatch[1]);
        expect(timeMs).toBeGreaterThanOrEqual(0); // Allow 0ms for very fast responses
        expect(timeMs).toBeLessThan(30000); // Should be less than 30 seconds
      }
    }
  });

  test('GET /api/health/storage should verify actual MinIO connection status', async () => {
    const response = await request(app)
      .get('/api/health/storage')
      .expect('Content-Type', /json/);
    
    expect(response.status).toBeOneOf([200, 503, 500]);
    expect(response.body).toHaveProperty('service', 'storage');
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
    
    if (response.status !== 500) {
      expect(response.body).toHaveProperty('connected');
      expect(typeof response.body.connected).toBe('boolean');
      expect(response.body).toHaveProperty('responseTime');
      
      // CRITICAL: Validate that HTTP status matches actual connection
      if (response.body.connected === true) {
        expect(response.body.status).toBe('healthy');
        expect(response.status).toBe(200);
      } else {
        expect(response.body.status).toBe('unhealthy');
        expect(response.status).toBe(503);
        expect(response.body).toHaveProperty('error');
      }
      
      // Validate response time is reasonable
      const responseTimeMatch = response.body.responseTime.match(/(\d+)ms/);
      if (responseTimeMatch) {
        const timeMs = parseInt(responseTimeMatch[1]);
        expect(timeMs).toBeGreaterThanOrEqual(0);
        expect(timeMs).toBeLessThan(30000); // Should be less than 30 seconds
      }
    }
  });

  test('GET /api/health/ready should validate actual service readiness', async () => {
    const response = await request(app)
      .get('/api/health/ready')
      .expect('Content-Type', /json/);
    
    expect(response.status).toBeOneOf([200, 503, 500]);
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
    
    if (response.status !== 500) {
      expect(response.body.status).toBeOneOf(['ready', 'not ready']);
      
      // CRITICAL: Validate readiness logic
      if (response.body.status === 'ready') {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Service is ready to accept traffic');
      } else {
        expect(response.status).toBe(503);
        expect(response.body).toHaveProperty('message', 'Service is not ready to accept traffic');
        expect(response.body).toHaveProperty('reasons');
        
        // Reasons should indicate which services are not ready
        expect(response.body.reasons).toHaveProperty('database');
        expect(response.body.reasons).toHaveProperty('storage');
      }
    }
  });

  test('GET /api/health/live should always return alive (liveness probe)', async () => {
    const response = await request(app)
      .get('/api/health/live')
      .expect('Content-Type', /json/)
      .expect(200); // Liveness should ALWAYS return 200
    
    expect(response.body).toHaveProperty('status', 'alive');
    expect(response.body).toHaveProperty('message', 'Service is alive');
    expect(response.body).toHaveProperty('uptime');
    
    // Validate uptime format
    expect(typeof response.body.uptime).toBe('string');
    expect(response.body.uptime).toMatch(/\d+s/);
  });

  test('Health checks should provide meaningful error information when services fail', async () => {
    // Test all endpoints to ensure they handle service failures gracefully
    const endpoints = [
      '/api/health',
      '/api/health/database', 
      '/api/health/storage',
      '/api/health/ready'
    ];
    
    for (const endpoint of endpoints) {
      const response = await request(app).get(endpoint);
      
      // Should always return a valid JSON response
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      
      // Should return appropriate HTTP status codes, never crash
      expect([200, 503, 500]).toContain(response.status);
      
      // If unhealthy or error, should indicate the problem properly
      if (response.status === 503) {
        // For 503 responses, service should be marked as unhealthy/not ready/down
        const isProperlyUnhealthy = (
          response.body.status === 'unhealthy' ||
          response.body.status === 'not ready' ||
          (response.body.services && (
            response.body.services.database?.status === 'down' || 
            response.body.services.storage?.status === 'down'
          ))
        );
        expect(isProperlyUnhealthy).toBeTruthy();
      }
      
      if (response.status === 500) {
        // For 500 responses, should have error information
        expect(response.body.error || response.body.message).toBeDefined();
      }
    }
  });

  test('Response times should be tracked and reasonable', async () => {
    const response = await request(app).get('/api/health');
    
    if (response.status !== 500 && response.body.responseTime) {
      const responseTimeMatch = response.body.responseTime.match(/(\d+)ms/);
      expect(responseTimeMatch).toBeTruthy();
      
      const timeMs = parseInt(responseTimeMatch[1]);
      expect(timeMs).toBeGreaterThanOrEqual(0);
      expect(timeMs).toBeLessThan(30000); // Should complete within 30 seconds
    }
  });
});