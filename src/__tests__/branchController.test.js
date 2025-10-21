import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock the branch service for controller tests
const mockBranchService = {
  addBranch: jest.fn(),
  getAllBranches: jest.fn(),
  getBranchById: jest.fn(),
  updateBranch: jest.fn(),
  deleteBranch: jest.fn(),
};

// Mock the service module before importing
jest.unstable_mockModule('../services/branchService.js', () => ({
  default: mockBranchService
}));

// Import after mocking for controller tests
const { default: branchRoutes } = await import('../routes/branch.js');

const app = express();
app.use(express.json());
app.use('/api/v1/branches', branchRoutes);

describe('Branch Controller Tests (HTTP Layer)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/branches', () => {
    it('should create a new branch successfully', async () => {
      const mockBranch = {
        id: 1,
        name: 'Colombo Branch',
        location: 'Colombo 07',
        manager_id: 10,
        createdAt: '2025-10-21T03:23:54.729Z',
        updatedAt: '2025-10-21T03:23:54.729Z'
      };

      mockBranchService.addBranch.mockResolvedValue({
        success: true,
        data: mockBranch,
        message: 'Branch created successfully'
      });

      const res = await request(app)
        .post('/api/v1/branches')
        .send({
          name: 'Colombo Branch',
          location: 'Colombo 07',
          manager_id: 10,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockBranch);
      expect(res.body.message).toBe('Branch created successfully');
      expect(mockBranchService.addBranch).toHaveBeenCalledWith({
        name: 'Colombo Branch',
        location: 'Colombo 07',
        manager_id: 10
      });
    });

    it('should reject branch with missing name', async () => {
      const res = await request(app)
        .post('/api/v1/branches')
        .send({
          location: 'Colombo 07',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Name and location are required');
      expect(mockBranchService.addBranch).not.toHaveBeenCalled();
    });

    it('should reject branch with missing location', async () => {
      const res = await request(app)
        .post('/api/v1/branches')
        .send({
          name: 'Test Branch',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);  
      expect(res.body.message).toBe('Name and location are required');
      expect(mockBranchService.addBranch).not.toHaveBeenCalled();
    });

    it('should return 400 when service returns failure', async () => {
      mockBranchService.addBranch.mockResolvedValue({
        success: false,
        message: 'Failed to create branch',
        error: 'Database error'
      });

      const res = await request(app)
        .post('/api/v1/branches')
        .send({
          name: 'Test Branch',
          location: 'Test Location',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Failed to create branch');
    });

    it('should handle service layer exceptions', async () => {
      mockBranchService.addBranch.mockRejectedValue(new Error('Database connection failed'));

      const res = await request(app)
        .post('/api/v1/branches')
        .send({
          name: 'Test Branch',
          location: 'Test Location',
        });

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Internal server error');
      expect(res.body.error).toBe('Database connection failed');
    });
  });

  describe('GET /api/v1/branches', () => {
    it('should get all branches successfully', async () => {
      const mockBranches = [
        { id: 1, name: 'Branch 1', location: 'Location 1', manager_id: 10 },
        { id: 2, name: 'Branch 2', location: 'Location 2', manager_id: 20 }
      ];

      mockBranchService.getAllBranches.mockResolvedValue({
        success: true,
        data: mockBranches,
        count: 2,
        message: 'Branches retrieved successfully'
      });

      const res = await request(app).get('/api/v1/branches');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockBranches);
      expect(res.body.count).toBe(2);
      expect(mockBranchService.getAllBranches).toHaveBeenCalled();
    });

    it('should return 404 when service returns failure', async () => {
      mockBranchService.getAllBranches.mockResolvedValue({
        success: false,
        message: 'No branches found'
      });

      const res = await request(app).get('/api/v1/branches');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('No branches found');
    });

    it('should handle service layer exceptions', async () => {
      mockBranchService.getAllBranches.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/v1/branches');

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Internal server error');
    });
  });

  describe('GET /api/v1/branches/:id', () => {
    it('should get branch by valid ID', async () => {
      const mockBranch = {
        id: 1,
        name: 'Colombo Branch',
        location: 'Colombo 07',
        manager_id: 10
      };

      mockBranchService.getBranchById.mockResolvedValue({
        success: true,
        data: mockBranch,
        message: 'Branch retrieved successfully'
      });

      const res = await request(app).get('/api/v1/branches/1');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockBranch);
      expect(mockBranchService.getBranchById).toHaveBeenCalledWith(1);
    });

    it('should return 404 for non-existent branch ID', async () => {
      mockBranchService.getBranchById.mockResolvedValue({
        success: false,
        message: 'Branch not found'
      });

      const res = await request(app).get('/api/v1/branches/9999');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Branch not found');
      expect(mockBranchService.getBranchById).toHaveBeenCalledWith(9999);
    });

    it('should handle service layer exceptions', async () => {
      mockBranchService.getBranchById.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/v1/branches/1');

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Internal server error');
    });
  });

  describe('PUT /api/v1/branches/:id', () => {
    it('should update branch successfully', async () => {
      const mockUpdatedBranch = {
        id: 1,
        name: 'Colombo Updated',
        location: 'Colombo 07',
        manager_id: 20
      };

      mockBranchService.updateBranch.mockResolvedValue({
        success: true,
        data: mockUpdatedBranch,
        message: 'Branch updated successfully'
      });

      const res = await request(app)
        .put('/api/v1/branches/1')
        .send({
          name: 'Colombo Updated',
          manager_id: 20
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockUpdatedBranch);
      expect(mockBranchService.updateBranch).toHaveBeenCalledWith('1', {
        name: 'Colombo Updated',
        manager_id: 20,
        location: undefined
      });
    });

    it('should return 404 for non-existent branch update', async () => {
      mockBranchService.updateBranch.mockResolvedValue({
        success: false,
        message: 'Branch not found'
      });

      const res = await request(app)
        .put('/api/v1/branches/9999')
        .send({
          name: 'No Branch'
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Branch not found');
    });

    it('should handle service layer exceptions', async () => {
      mockBranchService.updateBranch.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .put('/api/v1/branches/1')
        .send({ name: 'Test' });

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Internal server error');
    });
  });

  describe('DELETE /api/v1/branches/:id', () => {
    it('should delete branch successfully', async () => {
      mockBranchService.deleteBranch.mockResolvedValue({
        success: true,
        message: 'Branch deleted successfully'
      });

      const res = await request(app).delete('/api/v1/branches/1');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Branch deleted successfully');
      expect(mockBranchService.deleteBranch).toHaveBeenCalledWith(1);
    });

    it('should return 404 when deleting non-existent branch', async () => {
      mockBranchService.deleteBranch.mockResolvedValue({
        success: false,
        message: 'Branch not found'
      });

      const res = await request(app).delete('/api/v1/branches/9999');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Branch not found');
    });

    it('should handle service layer exceptions', async () => {
      mockBranchService.deleteBranch.mockRejectedValue(new Error('Database error'));

      const res = await request(app).delete('/api/v1/branches/1');

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Internal server error');
    });
  });
});