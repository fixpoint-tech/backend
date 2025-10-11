import issueService from '../services/issueService.js';

class IssueController {
  // POST /api/issues - Create new issue
  async createIssue(req, res) {
    try {
      const { branch_id, title, userid, description } = req.body;

      // Validation
      if (!branch_id || !title || !userid) {
        return res.status(400).json({
          success: false,
          message: 'Branch ID, title, and user ID are required'
        });
      }

      const result = await issueService.createIssue({
        branch_id: parseInt(branch_id),
        title,
        userid: parseInt(userid),
        description
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
        error: error.message
      });
    }
  }

  // GET /api/issues - Get all issues
  async getAllIssues(req, res) {
    try {
      const { branch_id, userid, search, limit, offset } = req.query;

      const filters = {};
      if (branch_id) filters.branch_id = parseInt(branch_id);
      if (userid) filters.userid = parseInt(userid);
      if (search) filters.search = search;
      if (limit) filters.limit = parseInt(limit);
      if (offset) filters.offset = parseInt(offset);

      const result = await issueService.getAllIssues(filters);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(500).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}
export default new IssueController();
