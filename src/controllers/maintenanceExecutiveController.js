import userService from '../services/userService.js';
import { uploadProfilePicture } from '../services/uploadService.js';

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
      // Handle file upload if present
      let profilePictureUrl = req.body.profilePicture;
      
      if (req.file) {
        try {
          profilePictureUrl = await uploadProfilePicture(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
          );
        } catch (uploadError) {
          return res.status(500).json({
            success: false,
            message: `File upload failed: ${uploadError.message}`
          });
        }
      }

      // Extract user fields from request body
      const { name, email, password, phone } = req.body;
      
      const userData = {
        name,
        email,
        role: 'maintenance_executive'
      };
      
      // Add optional user fields if provided
      if (password !== undefined) userData.password = password;
      if (phone !== undefined) userData.phone = phone;
      if (profilePictureUrl !== undefined) userData.profilePicture = profilePictureUrl;

      // Extract profile-specific fields (everything else)
      const profileData = {};
      const userFields = ['name', 'email', 'password', 'phone', 'profilePicture', 'role'];
      Object.keys(req.body).forEach(key => {
        if (!userFields.includes(key)) {
          profileData[key] = req.body[key];
        }
      });

      const executive = await userService.createUser(userData, profileData);

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

      // Handle file upload if present
      let profilePictureUrl = req.body.profilePicture;
      
      if (req.file) {
        try {
          profilePictureUrl = await uploadProfilePicture(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
          );
        } catch (uploadError) {
          return res.status(500).json({
            success: false,
            message: `File upload failed: ${uploadError.message}`
          });
        }
      }

      // ✅ Allow updating email along with name and phone
      const { name, phone, email, ...profileData } = req.body;
      
      const userData = {};
      if (name !== undefined) userData.name = name;
      if (phone !== undefined) userData.phone = phone;
      if (email !== undefined) userData.email = email;
      if (profilePictureUrl !== undefined) userData.profilePicture = profilePictureUrl;

      const updatedExecutive = await userService.updateUser(req.params.id, userData, profileData);

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
