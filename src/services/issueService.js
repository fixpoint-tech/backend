import { Issue } from '../models/index.js';
import { Op } from 'sequelize';

class IssueService {
  // Create a new issue
  async createIssue(issueData) {
    try {
      const issue = await Issue.create(issueData);
      return {
        success: true,
        data: issue,
        message: 'Issue created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to create issue'
      };
    }
  }

  // Get all issues with optional filtering
  async getAllIssues(filters = {}) {
    try {
      const where = {};
      
      // Apply filters if provided
      if (filters.branch_id) {
        where.branch_id = filters.branch_id;
      }
      
      if (filters.userid) {
        where.userid = filters.userid;
      }
      
      if (filters.search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${filters.search}%` } },
          { description: { [Op.iLike]: `%${filters.search}%` } }
        ];
      }

      const issues = await Issue.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: filters.limit || 100,
        offset: filters.offset || 0
      });

      return {
        success: true,
        data: issues,
        count: issues.length,
        message: 'Issues retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve issues'
      };
    }
  }
}

export default new IssueService();