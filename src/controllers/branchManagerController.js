import userService from '../services/userService.js';

/**
 * Branch Manager Controller
 * Handles all HTTP requests for branch manager operations
 */
class BranchManagerController {
  /**
   * Create a new branch manager
   * POST /api/v1/users/branch-managers
   */
  async createBranchManager(req, res) {
    try {
      // Extract user fields from request body
      const { name, email, password, phone, profilePicture } = req.body;
      
      const userData = {
        name,
        email,
        role: 'branch_manager'
      };
      
      // Add optional user fields if provided
      if (password !== undefined) userData.password = password;
      if (phone !== undefined) userData.phone = phone;
      if (profilePicture !== undefined) userData.profilePicture = profilePicture;

      // Extract profile-specific fields (everything else)
      const profileData = {};
      const userFields = ['name', 'email', 'password', 'phone', 'profilePicture', 'role'];
      Object.keys(req.body).forEach(key => {
        if (!userFields.includes(key)) {
          profileData[key] = req.body[key];
        }
      });

      const branchManager = await userService.createUser(userData, profileData);

      res.status(201).json({
        success: true,
        message: 'Branch manager created successfully',
        data: branchManager
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all branch managers
   * GET /api/v1/users/branch-managers
   */
  async getAllBranchManagers(req, res) {
    try {
      const branchManagers = await userService.getUsersByRole('branch_manager');

      res.status(200).json({
        success: true,
        count: branchManagers.length,
        data: branchManagers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get branch manager by ID
   * GET /api/v1/users/branch-managers/:id
   */
  async getBranchManagerById(req, res) {
    try {
      const branchManager = await userService.getUserById(req.params.id);

      if (branchManager.role !== 'branch_manager') {
        return res.status(404).json({
          success: false,
          message: 'Branch manager not found'
        });
      }

      res.status(200).json({
        success: true,
        data: branchManager
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update branch manager
   * PUT /api/v1/users/branch-managers/:id
   */
  async updateBranchManager(req, res) {
    try {
      const branchManager = await userService.getUserById(req.params.id);

      if (branchManager.role !== 'branch_manager') {
        return res.status(404).json({
          success: false,
          message: 'Branch manager not found'
        });
      }

      const { name, phone, profilePicture, ...profileData } = req.body;
      
      const userData = {};
      if (name !== undefined) userData.name = name;
      if (phone !== undefined) userData.phone = phone;
      if (profilePicture !== undefined) userData.profilePicture = profilePicture;

      const updatedBranchManager = await userService.updateUser(req.params.id, userData, profileData);

      res.status(200).json({
        success: true,
        message: 'Branch manager updated successfully',
        data: updatedBranchManager
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete branch manager (soft delete)
   * DELETE /api/v1/users/branch-managers/:id
   */
  async deleteBranchManager(req, res) {
    try {
      const branchManager = await userService.getUserById(req.params.id);

      if (branchManager.role !== 'branch_manager') {
        return res.status(404).json({
          success: false,
          message: 'Branch manager not found'
        });
      }

      const result = await userService.deleteUser(req.params.id);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new BranchManagerController();
