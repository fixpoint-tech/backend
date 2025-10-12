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
      // Extract user fields from request body
      const { name, email, password, phone, profilePicture } = req.body;
      
      const userData = {
        name,
        email,
        role: 'technician'
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

      const technician = await userService.createUser(userData, profileData);

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

      const { name, phone, profilePicture, ...profileData } = req.body;
      
      const userData = {};
      if (name !== undefined) userData.name = name;
      if (phone !== undefined) userData.phone = phone;
      if (profilePicture !== undefined) userData.profilePicture = profilePicture;

      const updatedTechnician = await userService.updateUser(req.params.id, userData, profileData);

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
