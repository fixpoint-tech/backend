import userService from '../services/userService.js';

/**
 * Technician Controller
 * Handles all HTTP requests for technician operations
 */
class TechnicianController {
  /**
   * Create a new technician
   * POST /api/v1/users/technicians
   */
  async createTechnician(req, res) {
    try {
      const technicianData = {
        ...req.body,
        role: 'technician'
      };

      const technician = await userService.createUser(technicianData);

      res.status(201).json({
        success: true,
        message: 'Technician created successfully',
        data: technician
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all technicians
   * GET /api/v1/users/technicians
   */
  async getAllTechnicians(req, res) {
    try {
      const technicians = await userService.getUsersByRole('technician');

      res.status(200).json({
        success: true,
        count: technicians.length,
        data: technicians
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get technician by ID
   * GET /api/v1/users/technicians/:id
   */
  async getTechnicianById(req, res) {
    try {
      const technician = await userService.getUserById(req.params.id);

      if (technician.role !== 'technician') {
        return res.status(404).json({
          success: false,
          message: 'Technician not found'
        });
      }

      res.status(200).json({
        success: true,
        data: technician
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update technician
   * PUT /api/v1/users/technicians/:id
   */
  async updateTechnician(req, res) {
    try {
      const technician = await userService.getUserById(req.params.id);

      if (technician.role !== 'technician') {
        return res.status(404).json({
          success: false,
          message: 'Technician not found'
        });
      }

      const updatedTechnician = await userService.updateUser(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: 'Technician updated successfully',
        data: updatedTechnician
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete technician (soft delete)
   * DELETE /api/v1/users/technicians/:id
   */
  async deleteTechnician(req, res) {
    try {
      const technician = await userService.getUserById(req.params.id);

      if (technician.role !== 'technician') {
        return res.status(404).json({
          success: false,
          message: 'Technician not found'
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

export default new TechnicianController();
