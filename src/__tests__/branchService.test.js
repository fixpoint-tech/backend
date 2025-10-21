import { jest } from '@jest/globals';

// Create a mock Branch model
const mockBranch = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  destroy: jest.fn(),
};

// Mock the models module before importing the service
jest.unstable_mockModule('../models/index.js', () => ({
  default: {
    Branch: mockBranch
  }
}));

// Import branchService after mocking
const { default: branchService } = await import('../services/branchService.js');

describe('Branch Service Layer Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addBranch', () => {
    it('should create a branch successfully', async () => {
      const mockBranchData = {
        name: 'Test Branch',
        location: 'Test Location',
        manager_id: 10
      };

      const mockCreatedBranch = {
        id: 1,
        ...mockBranchData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockBranch.create.mockResolvedValue(mockCreatedBranch);

      const result = await branchService.addBranch(mockBranchData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedBranch);
      expect(result.message).toBe('Branch created successfully');
      expect(mockBranch.create).toHaveBeenCalledWith(mockBranchData);
    });

    it('should handle database errors during creation', async () => {
      const mockBranchData = {
        name: 'Test Branch',
        location: 'Test Location',
        manager_id: 10
      };

      mockBranch.create.mockRejectedValue(new Error('Database constraint violation'));

      const result = await branchService.addBranch(mockBranchData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to create branch');
      expect(result.error).toBe('Database constraint violation');
    });
  });

  describe('getAllBranches', () => {
    it('should retrieve all branches successfully', async () => {
      const mockBranches = [
        { id: 1, name: 'Branch 1', location: 'Location 1', manager_id: 10 },
        { id: 2, name: 'Branch 2', location: 'Location 2', manager_id: 20 }
      ];

      mockBranch.findAll.mockResolvedValue(mockBranches);

      const result = await branchService.getAllBranches();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBranches);
      expect(result.count).toBe(2);
      expect(result.message).toBe('Branches retrieved successfully');
      expect(mockBranch.findAll).toHaveBeenCalled();
    });

    it('should handle database errors during retrieval', async () => {
      mockBranch.findAll.mockRejectedValue(new Error('Database connection failed'));

      const result = await branchService.getAllBranches();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to retrieve branches');
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('getBranchById', () => {
    it('should retrieve branch by ID successfully', async () => {
      const mockBranchResult = {
        id: 1,
        name: 'Test Branch',
        location: 'Test Location',
        manager_id: 10
      };

      mockBranch.findByPk.mockResolvedValue(mockBranchResult);

      const result = await branchService.getBranchById(1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBranchResult);
      expect(result.message).toBe('Branch retrieved successfully');
      expect(mockBranch.findByPk).toHaveBeenCalledWith(1);
    });

    it('should return failure when branch not found', async () => {
      mockBranch.findByPk.mockResolvedValue(null);

      const result = await branchService.getBranchById(999);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Branch not found');
      expect(mockBranch.findByPk).toHaveBeenCalledWith(999);
    });

    it('should handle database errors during retrieval', async () => {
      mockBranch.findByPk.mockRejectedValue(new Error('Database error'));

      const result = await branchService.getBranchById(1);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to retrieve branch');
      expect(result.error).toBe('Database error');
    });
  });

  describe('updateBranch', () => {
    it('should update branch successfully', async () => {
      const mockBranchInstance = {
        id: 1,
        name: 'Old Name',
        location: 'Old Location',
        manager_id: 10,
        update: jest.fn().mockResolvedValue()
      };

      const updateData = {
        name: 'New Name',
        manager_id: 20
      };

      mockBranch.findByPk.mockResolvedValue(mockBranchInstance);

      const result = await branchService.updateBranch(1, updateData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBranchInstance);
      expect(result.message).toBe('Branch updated successfully');
      expect(mockBranch.findByPk).toHaveBeenCalledWith(1);
      expect(mockBranchInstance.update).toHaveBeenCalledWith(updateData);
    });

    it('should return failure when branch not found for update', async () => {
      mockBranch.findByPk.mockResolvedValue(null);

      const result = await branchService.updateBranch(999, { name: 'Test' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Branch not found');
    });

    it('should handle database errors during update', async () => {
      const mockBranchInstance = {
        update: jest.fn().mockRejectedValue(new Error('Update failed'))
      };

      mockBranch.findByPk.mockResolvedValue(mockBranchInstance);

      const result = await branchService.updateBranch(1, { name: 'Test' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to update branch');
      expect(result.error).toBe('Update failed');
    });
  });

  describe('deleteBranch', () => {
    it('should delete branch successfully', async () => {
      const mockBranchInstance = {
        id: 1,
        name: 'Test Branch',
        destroy: jest.fn().mockResolvedValue()
      };

      mockBranch.findByPk.mockResolvedValue(mockBranchInstance);

      const result = await branchService.deleteBranch(1);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Branch deleted successfully');
      expect(mockBranch.findByPk).toHaveBeenCalledWith(1);
      expect(mockBranchInstance.destroy).toHaveBeenCalled();
    });

    it('should return failure when branch not found for deletion', async () => {
      mockBranch.findByPk.mockResolvedValue(null);

      const result = await branchService.deleteBranch(999);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Branch not found');
    });

    it('should handle database errors during deletion', async () => {
      const mockBranchInstance = {
        destroy: jest.fn().mockRejectedValue(new Error('Deletion failed'))
      };

      mockBranch.findByPk.mockResolvedValue(mockBranchInstance);

      const result = await branchService.deleteBranch(1);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to delete branch');
      expect(result.error).toBe('Deletion failed');
    });
  });
});