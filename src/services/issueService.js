import models from '../models/index.js';

const { Issue, Branch, BranchManager, Technician, MaintenanceExecutive, ThirdParty, Message, PettyCashRequest, User, Status } = models;
import OutsidePartyRequest from '../models/outsidePartyRequest.js';
import { Op } from 'sequelize';

class IssueService {
  // Create a new issue
  async createIssue(issueData) {
    try {
      let { manager_id, branch_id } = issueData;

      // Validate branch exists
      const branch = await Branch.findByPk(branch_id);
      if (!branch) {
        return {
          success: false,
          message: 'Invalid branch ID'
        };
      }

      // If manager_id is not provided or is 0, auto-assign a branch manager
      if (!manager_id) {
        // Try to find a manager assigned to this specific branch first
        let autoManager = await BranchManager.findOne({ where: { branchId: parseInt(branch_id) } });

        // If no branch-specific manager found, pick any available branch manager
        if (!autoManager) {
          autoManager = await BranchManager.findOne();
        }

        if (!autoManager) {
          return {
            success: false,
            message: 'No branch manager available to assign. Please contact support.'
          };
        }

        manager_id = autoManager.id;
        issueData = { ...issueData, manager_id };
      } else {
        // Validate provided branch manager exists
        const branchManager = await BranchManager.findByPk(manager_id);
        if (!branchManager) {
          return {
            success: false,
            message: 'Invalid branch manager ID'
          };
        }

        // Validate that branch manager is assigned to the specified branch
        if (branchManager.branchId && branchManager.branchId !== parseInt(branch_id)) {
          return {
            success: false,
            message: `Branch manager is assigned to branch ${branchManager.branchId}, but issue is for branch ${branch_id}`
          };
        }

        if (!branchManager.branchId) {
          console.warn(`Branch manager ${manager_id} has no assigned branch, but creating issue for branch ${branch_id}`);
        }
      }

      // Create the issue
      const issue = await Issue.create(issueData);

      return {
        success: true,
        message: 'Issue created successfully',
        data: issue
      };
    } catch (error) {
      console.error('Error creating issue:', error);
      return {
        success: false,
        message: 'Failed to create issue',
        error: error.message
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

      if (filters.manager_id) {
        where.manager_id = filters.manager_id;
      }

      if (filters.technician_id) {
        where.technician_id = filters.technician_id;
      }

      if (filters.maintenance_executive_id) {
        where.maintenance_executive_id = filters.maintenance_executive_id;
      }

      if (filters.third_party_id) {
        where.third_party_id = filters.third_party_id;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${filters.search}%` } },
          { description: { [Op.iLike]: `%${filters.search}%` } }
        ];
      }

      // Build include array based on whether relations are requested
      const include = [];
      if (filters.include_relations) {
        include.push(
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name', 'location']
          },
          {
            model: BranchManager,
            as: 'manager',
            attributes: ['id'],
            include: [{
              model: models.User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }]
          },
          {
            model: Technician,
            as: 'technician',
            attributes: ['id', 'specialization'],
            include: [{
              model: models.User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }]
          },
          {
            model: MaintenanceExecutive,
            as: 'maintenanceExecutive',
            attributes: ['id'],
            include: [{
              model: models.User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }]
          },
          {
            model: ThirdParty,
            as: 'thirdParty',
            attributes: ['id', 'organization', 'email', 'worktype']
          }
        );
      }

      const { count, rows: issues } = await Issue.findAndCountAll({
        where,
        include,
        order: [['createdAt', 'DESC']],
        limit: filters.limit || 100,
        offset: filters.offset || 0,
        distinct: true
      });

      return {
        success: true,
        data: issues,
        count: issues.length,
        total: count,
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

  // Get issue by ID
  async getIssueById(id, includeRelations = false) {
    try {
      const include = [];

      if (includeRelations) {
        include.push(
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name', 'location']
          },
          {
            model: BranchManager,
            as: 'manager',
            attributes: ['id'],
            include: [{
              model: models.User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'phone']
            }]
          },
          {
            model: Technician,
            as: 'technician',
            attributes: ['id', 'specialization', 'experienceYears', 'isAvailable'],
            include: [{
              model: models.User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'phone']
            }]
          },
          {
            model: MaintenanceExecutive,
            as: 'maintenanceExecutive',
            attributes: ['id'],
            include: [{
              model: models.User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'phone']
            }]
          },
          {
            model: ThirdParty,
            as: 'thirdParty',
            attributes: ['id', 'organization', 'email', 'worktype', 'location', 'phone']
          },
          {
            model: Message,
            as: 'messages',
            attributes: ['id', 'body', 'sender_id', 'receiver_id', 'createdAt'],
            include: [
              {
                model: models.User,
                as: 'sender',
                attributes: ['id', 'name', 'email']
              },
              {
                model: models.User,
                as: 'receiver',
                attributes: ['id', 'name', 'email']
              }
            ]
          },
          {
            model: PettyCashRequest,
            as: 'pettyCashRequests',
            attributes: ['id', 'technician_id', 'amount', 'description', 'status', 'createdAt']
          },
          {
            model: OutsidePartyRequest,
            as: 'outsidePartyRequests',
            attributes: ['id', 'issue_id', 'suggested_by', 'vendor_name', 'description', 'status', 'approved_by', 'approval_comment', 'createdAt']
          },
          {
            model: Status,
            as: 'statuses',
            attributes: ['id', 'user_id', 'description', 'image_url', 'status_type', 'createdAt'],
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'profilePicture']
            }]
          }
        );
      }

      const queryOptions = {
        include,
        order: []
      };

      // Add ordering for nested associations when including relations
      if (includeRelations) {
        queryOptions.order = [
          [{ model: Message, as: 'messages' }, 'createdAt', 'ASC'],
          [{ model: PettyCashRequest, as: 'pettyCashRequests' }, 'createdAt', 'DESC'],
          [{ model: OutsidePartyRequest, as: 'outsidePartyRequests' }, 'createdAt', 'DESC'],
          [{ model: Status, as: 'statuses' }, 'createdAt', 'ASC']
        ];
      }

      const issue = await Issue.findByPk(id, queryOptions);

      if (!issue) {
        return {
          success: false,
          message: 'Issue not found'
        };
      }

      return {
        success: true,
        data: issue,
        message: 'Issue retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve issue'
      };
    }
  }

  // Update issue
  async updateIssue(id, updateData) {
    try {
      const issue = await Issue.findByPk(id);

      if (!issue) {
        return {
          success: false,
          message: 'Issue not found'
        };
      }

      await issue.update(updateData);

      // Fetch full updated issue to return to the client
      const updatedIssueResult = await this.getIssueById(id, true);

      return {
        success: true,
        data: updatedIssueResult.data,
        message: 'Issue updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to update issue'
      };
    }
  }

  // Delete issue
  async deleteIssue(id) {
    try {
      const issue = await Issue.findByPk(id);

      if (!issue) {
        return {
          success: false,
          message: 'Issue not found'
        };
      }

      await issue.destroy();

      return {
        success: true,
        message: 'Issue deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete issue'
      };
    }
  }

  // Assign technician to issue
  async assignTechnician(issueId, technicianId) {
    try {
      const issue = await Issue.findByPk(issueId);

      if (!issue) {
        return {
          success: false,
          message: 'Issue not found'
        };
      }

      // Verify technician exists
      const technician = await Technician.findByPk(technicianId);
      if (!technician) {
        return {
          success: false,
          message: 'Technician not found'
        };
      }

      await issue.update({
        technician_id: technicianId,
        technician_assigned_at: new Date()
      });

      // Fetch full updated issue to return to the client
      const updatedIssueResult = await this.getIssueById(issueId, true);

      return {
        success: true,
        data: updatedIssueResult.data,
        message: 'Technician assigned successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to assign technician'
      };
    }
  }

  // Assign maintenance executive to issue
  async assignMaintenanceExecutive(issueId, executiveId) {
    try {
      const issue = await Issue.findByPk(issueId);

      if (!issue) {
        return {
          success: false,
          message: 'Issue not found'
        };
      }

      // Verify maintenance executive exists
      const executive = await MaintenanceExecutive.findByPk(executiveId);
      if (!executive) {
        return {
          success: false,
          message: 'Maintenance Executive not found'
        };
      }

      await issue.update({
        maintenance_executive_id: executiveId,
        maintenance_executive_assigned_at: new Date()
      });

      // Fetch full updated issue to return to the client
      const updatedIssueResult = await this.getIssueById(issueId, true);

      return {
        success: true,
        data: updatedIssueResult.data,
        message: 'Maintenance Executive assigned successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to assign maintenance executive'
      };
    }
  }

  // Assign third party to issue
  async assignThirdParty(issueId, thirdPartyId) {
    try {
      const issue = await Issue.findByPk(issueId);

      if (!issue) {
        return {
          success: false,
          message: 'Issue not found'
        };
      }

      // Verify third party exists
      const thirdParty = await ThirdParty.findByPk(thirdPartyId);
      if (!thirdParty) {
        return {
          success: false,
          message: 'Third Party not found'
        };
      }

      await issue.update({
        third_party_id: thirdPartyId,
        third_party_assigned_at: new Date()
      });

      // Fetch full updated issue to return to the client
      const updatedIssueResult = await this.getIssueById(issueId, true);

      return {
        success: true,
        data: updatedIssueResult.data,
        message: 'Third Party assigned successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to assign third party'
      };
    }
  }

  // Update issue status
  async updateStatus(id, status) {
    try {
      const issue = await Issue.findByPk(id);

      if (!issue) {
        return {
          success: false,
          message: 'Issue not found'
        };
      }

      await issue.update({ status });

      // Fetch full updated issue to return to the client
      const updatedIssueResult = await this.getIssueById(id, true);

      return {
        success: true,
        data: updatedIssueResult.data,
        message: 'Issue status updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to update issue status'
      };
    }
  }
}

export default new IssueService();