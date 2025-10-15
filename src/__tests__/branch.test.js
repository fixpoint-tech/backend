// tests/branch.test.js
import request from 'supertest';
import express from 'express';
import { getSequelizeInstance } from '../services/connectionService.js';
import branchRoutes from '../routes/branch.js';
import Branch from '../models/branch.js';

const app = express();
app.use(express.json());
app.use('/api/v1/branches', branchRoutes);

let sequelize;

beforeAll(async () => {
  sequelize = getSequelizeInstance();
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Branch Endpoints', () => {
  let branchId;

  describe('POST /api/v1/branches', () => {
    it('should create a new branch', async () => {
      const res = await request(app).post('/api/v1/branches').send({
        name: 'Colombo Branch',
        location: 'Colombo 07',
        manager_id: 10,
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toBe('Colombo Branch');
      expect(res.body.data.location).toBe('Colombo 07');
      expect(res.body.data.manager_id).toBe(10);

      branchId = res.body.data.id;
    });

    it('should reject branch with missing name', async () => {
      const res = await request(app).post('/api/v1/branches').send({
        location: 'Colombo 07',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Name and location are required');
    });

    it('should reject branch with missing location', async () => {
      const res = await request(app).post('/api/v1/branches').send({
        name: 'Test Branch',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Name and location are required');
    });
  });

  describe('GET /api/v1/branches', () => {
    it('should get all branches', async () => {
      const res = await request(app).get('/api/v1/branches');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/branches/:id', () => {
    it('should get branch by valid ID', async () => {
      const res = await request(app).get(`/api/v1/branches/${branchId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(branchId);
      expect(res.body.data.name).toBe('Colombo Branch');
    });

    it('should return 404 for non-existent branch ID', async () => {
      const res = await request(app).get('/api/v1/branches/9999');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/branches/:id', () => {
    it('should update branch name and manager_id', async () => {
      const res = await request(app).put(`/api/v1/branches/${branchId}`).send({
        name: 'Colombo Updated',
        manager_id: 20
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Colombo Updated');
      expect(res.body.data.manager_id).toBe(20);
      expect(res.body.data.location).toBe('Colombo 07');
    });

    it('should return 404 for non-existent branch update', async () => {
      const res = await request(app).put('/api/v1/branches/9999').send({
        name: 'No Branch'
      });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/branches/:id', () => {
    it('should delete branch', async () => {
      const res = await request(app).delete(`/api/v1/branches/${branchId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Branch deleted successfully');
    });

    it('should not find deleted branch', async () => {
      const res = await request(app).get(`/api/v1/branches/${branchId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 when deleting non-existent branch', async () => {
      const res = await request(app).delete('/api/v1/branches/9999');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});