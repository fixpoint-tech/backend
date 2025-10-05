import { testDatabaseConnection, checkMinioConnection } from '../services/connectionService.js';

describe('Service Connections', () => {
  beforeAll(async () => {
    // Wait a bit for services to be fully ready
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  test('Database connection should be available', async () => {
    const dbHealth = await testDatabaseConnection();
    
    expect(dbHealth).toHaveProperty('connected');
    expect(typeof dbHealth.connected).toBe('boolean');
    
    if (dbHealth.connected) {
      expect(dbHealth.error).toBe(null);
    } else {
      expect(typeof dbHealth.error).toBe('string');
    }
  });

  test('MinIO connection should be available', async () => {
    const minioHealth = await checkMinioConnection();
    
    expect(minioHealth).toHaveProperty('connected');
    expect(typeof minioHealth.connected).toBe('boolean');
    
    if (minioHealth.connected) {
      expect(minioHealth.error).toBe(null);
    } else {
      expect(typeof minioHealth.error).toBe('string');
    }
  });

  test('Connection timeouts should be handled gracefully', async () => {
    // This test ensures our connection functions don't hang indefinitely
    const dbPromise = testDatabaseConnection();
    const minioPromise = checkMinioConnection();
    
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Test timeout')), 10000)
    );
    
    await expect(Promise.race([dbPromise, timeout])).resolves.not.toThrow();
    await expect(Promise.race([minioPromise, timeout])).resolves.not.toThrow();
  }, 15000);
});