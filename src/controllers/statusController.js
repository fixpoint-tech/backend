import statusService from '../services/statusService.js';

class StatusController {
  // POST /api/v1/issues/:id/statuses
  async createStatusForIssue(req, res) {
    try {
      const { id } = req.params;
      const { user_id, description, image_url, status_type } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Valid issue ID is required' });
      }

      const result = await statusService.createStatusForIssue(parseInt(id), {
        user_id,
        description,
        image_url,
        status_type
      });

      if (result.success) return res.status(201).json(result);

      if (result.message === 'Issue not found' || result.message === 'User not found') {
        return res.status(404).json(result);
      }

      return res.status(400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // GET /api/v1/issues/:id/statuses
  async getStatusesByIssue(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Valid issue ID is required' });
      }

      const result = await statusService.getStatusesByIssue(parseInt(id));

      if (result.success) return res.status(200).json(result);

      if (result.message === 'Issue not found') {
        return res.status(404).json(result);
      }

      return res.status(500).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

export default new StatusController();