import { Branch } from '../models/index.js';

class BranchService {
  // Create a new branch
  async addBranch(branchData) {
    try {
      console.log('branchData:', branchData); // Debug log
      const branch = await Branch.create(branchData);
      return {
        success: true,
        data: branch,
        message: 'Branch created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to create branch'
      };
    }
  }

  // Get all branches
  async getAllBranches() {
    try {
      const branches = await Branch.findAll();
      return {
        success: true,
        data: branches,
        count: branches.length,
        message: 'Branches retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve branches'
      };
    }
  }

  // Get single branch by ID
  async getBranchById(id) {
    try {
      const branch = await Branch.findByPk(id);
      if (!branch) {
        return { success: false, message: 'Branch not found' };
      }
      return {
        success: true,
        data: branch,
        message: 'Branch retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve branch'
      };
    }
  }

  // Update a branch
  async updateBranch(id, updateData) {
    try {
      const branch = await Branch.findByPk(id);
      if (!branch) {
        return { success: false, message: 'Branch not found' };
      }

      await branch.update(updateData);

      return {
        success: true,
        data: branch,
        message: 'Branch updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to update branch'
      };
    }
  }

  // Delete a branch
  async deleteBranch(id) {
    try {
      const branch = await Branch.findByPk(id);
      if (!branch) {
        return { success: false, message: 'Branch not found' };
      }

      await branch.destroy();

      return {
        success: true,
        message: 'Branch deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete branch'
      };
    }
  }
}

export default new BranchService();