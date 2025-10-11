import userService from '../services/userService.js';

/**
 * Maintenance Executive Controller
 * Handles all HTTP requests for maintenance executive operations
 */
class MaintenanceExecutiveController {
  /**
   * Create a new maintenance executive
   * POST /api/v1/users/maintenance-executives
   */
  async createMaintenanceExecutive(req, res) {
    try {
      const executiveData = {
        ...req.body,
        role: 'maintenance_executive'
      };

      const executive = await userService.createUser(executiveData);

      res.status(201).json({
        success: true,
        message: 'Maintenance executive created successfully',
        data: executive
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all maintenance executives
   * GET /api/v1/users/maintenance-executives
   */
  async getAllMaintenanceExecutives(req, res) {
    try {
      const executives = await userService.getUsersByRole('maintenance_executive');

      res.status(200).json({
        success: true,
        count: executives.length,
        data: executives
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get maintenance executive by ID
   * GET /api/v1/users/maintenance-executives/:id
   */
  async getMaintenanceExecutiveById(req, res) {
    try {
      const executive = await userService.getUserById(req.params.id);

      if (executive.role !== 'maintenance_executive') {
        return res.status(404).json({
          success: false,
          message: 'Maintenance executive not found'
        });
      }

      res.status(200).json({
        success: true,
        data: executive
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update maintenance executive
   * PUT /api/v1/users/maintenance-executives/:id
   */
  async updateMaintenanceExecutive(req, res) {
    try {
      const executive = await userService.getUserById(req.params.id);

      if (executive.role !== 'maintenance_executive') {
        return res.status(404).json({
          success: false,
          message: 'Maintenance executive not found'
        });
      }

      const updatedExecutive = await userService.updateUser(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: 'Maintenance executive updated successfully',
        data: updatedExecutive
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete maintenance executive (soft delete)
   * DELETE /api/v1/users/maintenance-executives/:id
   */
  async deleteMaintenanceExecutive(req, res) {
    try {
      const executive = await userService.getUserById(req.params.id);

      if (executive.role !== 'maintenance_executive') {
        return res.status(404).json({
          success: false,
          message: 'Maintenance executive not found'
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

export default new MaintenanceExecutiveController();
