import branchService from '../services/branchService.js';

class BranchController {
  // POST /api/v1/branches - Create a new branch
  async addBranch(req, res) {
    try {
      const { name, location, manager_id } = req.body; // Removed contactNumber

      // Validation
      if (!name || !location) {
        return res.status(400).json({
          success: false,
          message: 'Name and location are required',
        });
      }

      const result = await branchService.addBranch({ 
        name, 
        location, 
        manager_id
        // contactNumber removed
      });

      if (result.success) {
        return res.status(201).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }

  // GET /api/v1/branches - Get all branches
  async getAllBranches(req, res) {
    try {
      const result = await branchService.getAllBranches();

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(404).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }

  // GET /api/v1/branches/:id - Get branch by ID
  async getBranchById(req, res) {
    try {
      const { id } = req.params;

      const result = await branchService.getBranchById(parseInt(id));

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(404).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }

  // PUT /api/v1/branches/:id - Update branch by ID
  async updateBranch(req, res) {
    try {
      const { id } = req.params;
      const { name, location, manager_id } = req.body; // Removed contactNumber

      const result = await branchService.updateBranch(id, { 
        name, 
        location, 
        manager_id
        // contactNumber removed
      });

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(404).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }

  // DELETE /api/v1/branches/:id - Delete branch by ID
  async deleteBranch(req, res) {
    try {
      const { id } = req.params;

      const result = await branchService.deleteBranch(parseInt(id));

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(404).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }
}

export default new BranchController();