import models from '../models/index.js';

const { Status, Issue, User } = models;

class StatusService {
  async createStatusForIssue(issueId, statusData) {
    try {
      const issue = await Issue.findByPk(issueId);
      if (!issue) {
        return { success: false, message: 'Issue not found' };
      }

      const { user_id, description, image_url, status_type } = statusData;

      if (!user_id) return { success: false, message: 'user_id is required' };
      if (!description) return { success: false, message: 'description is required' };

      const parsedUserId = parseInt(user_id);
      if (isNaN(parsedUserId)) {
        return { success: false, message: 'user_id must be a valid integer' };
      }

      const user = await User.findByPk(parsedUserId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      const validTypes = ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
      if (status_type && !validTypes.includes(status_type)) {
        return { success: false, message: `status_type must be one of: ${validTypes.join(', ')}` };
      }

      const created = await Status.create({
        issue_id: parseInt(issueId),
        user_id: parsedUserId,
        description,
        image_url: image_url || null,
        status_type: status_type || 'Open'
      });

      return {
        success: true,
        message: 'Status update created successfully',
        data: created
      };
    } catch (error) {
      console.error('Error creating status update:', error);
      return {
        success: false,
        message: 'Failed to create status update',
        error: error.message
      };
    }
  }

  async getStatusesByIssue(issueId) {
    try {
      const issue = await Issue.findByPk(issueId);
      if (!issue) {
        return { success: false, message: 'Issue not found' };
      }

      const statuses = await Status.findAll({
        where: { issue_id: parseInt(issueId) },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['createdAt', 'ASC']]
      });

      return {
        success: true,
        message: 'Status updates retrieved successfully',
        data: statuses,
        count: statuses.length
      };
    } catch (error) {
      console.error('Error retrieving status updates:', error);
      return {
        success: false,
        message: 'Failed to retrieve status updates',
        error: error.message
      };
    }
  }
}

export default new StatusService();