/**
 * User Controller
 * Handles all user-related HTTP requests and responses
 */

import * as UserService from '../services/userService.js';

class UserController {
  /**
   * Create a new user
   * POST /api/users
   */
  static async createUser(req, res) {
    try {
      const userData = req.body;

      // Basic validation already done by middleware
      const user = await UserService.createUser(userData);

      // Remove password from response
      const userResponse = user.toJSON();
      delete userResponse.password;

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: userResponse
      });
    } catch (error) {
      console.error('Error creating user:', error);

      // Handle Sequelize unique constraint errors
      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = error.errors[0].path;
        return res.status(409).json({
          success: false,
          message: `${field} already exists`
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: error.message
      });
    }
  }

  /**
   * Get all users with optional filters
   * GET /api/users?role=technician&status=active&branchId=1&page=1&limit=10
   */
  static async getAllUsers(req, res) {
    try {
      const filters = {
        role: req.query.role,
        branchId: req.query.branchId,
        isActive: req.query.isActive,
        page: req.query.page,
        limit: req.query.limit
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => 
        filters[key] === undefined && delete filters[key]
      );

      const result = await UserService.getAllUsers(filters);

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        ...result
      });
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve users',
        error: error.message
      });
    }
  }

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  static async getUserById(req, res) {
    try {
      const { id } = req.params;

      const user = await UserService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: user
      });
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user',
        error: error.message
      });
    }
  }

  /**
   * Update user
   * PUT /api/users/:id
   */
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Don't allow role changes through this endpoint
      if (updateData.role) {
        delete updateData.role;
      }

      const updatedUser = await UserService.updateUser(id, updateData);

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Error updating user:', error);

      // Handle Sequelize unique constraint errors
      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = error.errors[0].path;
        return res.status(409).json({
          success: false,
          message: `${field} already in use by another user`
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: error.message
      });
    }
  }

  /**
   * Delete user (soft delete)
   * DELETE /api/users/:id
   */
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const deletedUser = await UserService.deleteUser(id);

      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        data: deletedUser
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error.message
      });
    }
  }

  /**
   * Get all technicians
   * GET /api/users/technicians
   */
  static async getAllTechnicians(req, res) {
    try {
      const technicians = await UserService.getUsersByRole('technician');

      res.status(200).json({
        success: true,
        message: 'Technicians retrieved successfully',
        count: technicians.length,
        data: technicians
      });
    } catch (error) {
      console.error('Error getting technicians:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve technicians',
        error: error.message
      });
    }
  }

  /**
   * Get all branch managers
   * GET /api/users/branch-managers
   */
  static async getAllBranchManagers(req, res) {
    try {
      const managers = await UserService.getUsersByRole('branch_manager');

      res.status(200).json({
        success: true,
        message: 'Branch managers retrieved successfully',
        count: managers.length,
        data: managers
      });
    } catch (error) {
      console.error('Error getting branch managers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve branch managers',
        error: error.message
      });
    }
  }

  /**
   * Get all maintenance executives
   * GET /api/users/maintenance-executives
   */
  static async getAllMaintenanceExecutives(req, res) {
    try {
      const executives = await UserService.getUsersByRole('maintenance_executive');

      res.status(200).json({
        success: true,
        message: 'Maintenance executives retrieved successfully',
        count: executives.length,
        data: executives
      });
    } catch (error) {
      console.error('Error getting maintenance executives:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve maintenance executives',
        error: error.message
      });
    }
  }

  /**
   * Get available technicians (for assignment)
   * GET /api/users/technicians/available?branchId=1
   */
  static async getAvailableTechnicians(req, res) {
    try {
      const filters = {
        branchId: req.query.branchId,
        isActive: true
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => 
        filters[key] === undefined && delete filters[key]
      );

      const technicians = await UserService.getUsersByRole('technician', filters);

      res.status(200).json({
        success: true,
        message: 'Available technicians retrieved successfully',
        count: technicians.length,
        data: technicians
      });
    } catch (error) {
      console.error('Error getting available technicians:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve available technicians',
        error: error.message
      });
    }
  }

  /**
   * Get user statistics
   * GET /api/users/stats
   */
  static async getUserStats(req, res) {
    try {
      const stats = await UserService.getUserStats();

      res.status(200).json({
        success: true,
        message: 'User statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      console.error('Error getting user stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user statistics',
        error: error.message
      });
    }
  }

  /**
   * Update user profile (for self-update)
   * PATCH /api/users/:id/profile
   */
  static async updateProfile(req, res) {
    try {
      const { id } = req.params;
      const { fullName, phone, profilePicture } = req.body;

      const updateData = {
        fullName,
        phone,
        profilePicture
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );

      const updatedUser = await UserService.updateUserProfile(id, updateData);

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message
      });
    }
  }
}

export default UserController;
