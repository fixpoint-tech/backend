import models from "../models/index.js";

const {
  Issue,
  Branch,
  BranchManager,
  Technician,
  MaintenanceExecutive,
  ThirdParty,
  Message,
  PettyCashRequest,
  User,
} = models;
import { Op } from "sequelize";

class IssueService {
  // Create a new issue
  async createIssue(issueData) {
    try {
      const { manager_id, branch_id } = issueData;

      // Validate branch exists
      const branch = await Branch.findByPk(branch_id);
      if (!branch) {
        return {
          success: false,
          message: "Invalid branch ID",
        };
      }

      // Validate branch manager exists
      const branchManager = await BranchManager.findByPk(manager_id);
      if (!branchManager) {
        return {
          success: false,
          message: "Invalid branch manager ID",
        };
      }

      // Validate that branch manager is assigned to the specified branch
      if (
        branchManager.branchId &&
        branchManager.branchId !== parseInt(branch_id)
      ) {
        return {
          success: false,
          message: `Branch manager is assigned to branch ${branchManager.branchId}, but issue is for branch ${branch_id}`,
        };
      }

      // If branch manager has no assigned branch, that might be okay or might be an error
      // depending on your business logic. For now, we'll allow it.
      if (!branchManager.branchId) {
        console.warn(
          `Branch manager ${manager_id} has no assigned branch, but creating issue for branch ${branch_id}`,
        );
      }

      // Create the issue
      const issue = await Issue.create(issueData);

      return {
        success: true,
        message: "Issue created successfully",
        data: issue,
      };
    } catch (error) {
      console.error("Error creating issue:", error);
      return {
        success: false,
        message: "Failed to create issue",
        error: error.message,
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
          { description: { [Op.iLike]: `%${filters.search}%` } },
        ];
      }

      // Build include array based on whether relations are requested
      const include = [];
      if (filters.include_relations) {
        include.push(
          {
            model: Branch,
            as: "branch",
            attributes: ["id", "name", "location"],
          },
          {
            model: BranchManager,
            as: "manager",
            attributes: ["id"],
            include: [
              {
                model: models.User,
                as: "user",
                attributes: ["id", "name", "email"],
              },
            ],
          },
          {
            model: Technician,
            as: "technician",
            attributes: ["id", "specialization"],
            include: [
              {
                model: models.User,
                as: "user",
                attributes: ["id", "name", "email"],
              },
            ],
          },
          {
            model: MaintenanceExecutive,
            as: "maintenanceExecutive",
            attributes: ["id"],
            include: [
              {
                model: models.User,
                as: "user",
                attributes: ["id", "name", "email"],
              },
            ],
          },
          {
            model: ThirdParty,
            as: "thirdParty",
            attributes: ["id", "organization", "email", "worktype"],
          },
        );
      }

      const { count, rows: issues } = await Issue.findAndCountAll({
        where,
        include,
        order: [["createdAt", "DESC"]],
        limit: filters.limit || 100,
        offset: filters.offset || 0,
        distinct: true,
      });

      return {
        success: true,
        data: issues,
        count: issues.length,
        total: count,
        message: "Issues retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Failed to retrieve issues",
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
            as: "branch",
            attributes: ["id", "name", "location"],
          },
          {
            model: BranchManager,
            as: "manager",
            attributes: ["id"],
            include: [
              {
                model: models.User,
                as: "user",
                attributes: ["id", "name", "email", "phone"],
              },
            ],
          },
          {
            model: Technician,
            as: "technician",
            attributes: [
              "id",
              "specialization",
              "experienceYears",
              "isAvailable",
            ],
            include: [
              {
                model: models.User,
                as: "user",
                attributes: ["id", "name", "email", "phone"],
              },
            ],
          },
          {
            model: MaintenanceExecutive,
            as: "maintenanceExecutive",
            attributes: ["id"],
            include: [
              {
                model: models.User,
                as: "user",
                attributes: ["id", "name", "email", "phone"],
              },
            ],
          },
          {
            model: ThirdParty,
            as: "thirdParty",
            attributes: [
              "id",
              "organization",
              "email",
              "worktype",
              "location",
              "phone",
            ],
          },
          {
            model: Message,
            as: "messages",
            attributes: ["id", "body", "sender_id", "receiver_id", "createdAt"],
            include: [
              {
                model: models.User,
                as: "sender",
                attributes: ["id", "name", "email"],
              },
              {
                model: models.User,
                as: "receiver",
                attributes: ["id", "name", "email"],
              },
            ],
          },
          {
            model: PettyCashRequest,
            as: "pettyCashRequests",
            attributes: [
              "id",
              "technician_id",
              "amount",
              "description",
              "status",
              "createdAt",
            ],
          },
        );
      }

      const queryOptions = {
        include,
        order: [],
      };

      // Add ordering for nested associations when including relations
      if (includeRelations) {
        queryOptions.order = [
          [{ model: Message, as: "messages" }, "createdAt", "ASC"],
          [
            { model: PettyCashRequest, as: "pettyCashRequests" },
            "createdAt",
            "DESC",
          ],
        ];
      }

      const issue = await Issue.findByPk(id, queryOptions);

      if (!issue) {
        return {
          success: false,
          message: "Issue not found",
        };
      }

      return {
        success: true,
        data: issue,
        message: "Issue retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Failed to retrieve issue",
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
          message: "Issue not found",
        };
      }

      await issue.update(updateData);

      // Fetch updated issue with relations
      const updatedIssue = await Issue.findByPk(id, {
        include: [
          {
            model: Branch,
            as: "branch",
            attributes: ["id", "name", "location"],
          },
          {
            model: BranchManager,
            as: "manager",
            attributes: ["id"],
            include: [
              {
                model: models.User,
                as: "user",
                attributes: ["id", "name", "email"],
              },
            ],
          },
          {
            model: ThirdParty,
            as: "thirdParty",
            attributes: ["id", "organization", "email"],
          },
        ],
      });

      return {
        success: true,
        data: updatedIssue,
        message: "Issue updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Failed to update issue",
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
          message: "Issue not found",
        };
      }

      await issue.destroy();

      return {
        success: true,
        message: "Issue deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Failed to delete issue",
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
          message: "Issue not found",
        };
      }

      // Verify technician exists
      const technician = await Technician.findByPk(technicianId);
      if (!technician) {
        return {
          success: false,
          message: "Technician not found",
        };
      }

      await issue.update({
        technician_id: technicianId,
        technician_assigned_at: new Date(),
      });

      // Fetch updated issue with technician info and assignment timestamp
      const updatedIssue = await Issue.findByPk(issueId, {
        attributes: [
          "id",
          "title",
          "description",
          "status",
          "technician_id",
          "technician_assigned_at",
          "updatedAt",
        ],
        include: [
          {
            model: Technician,
            as: "technician",
            attributes: ["id", "specialization", "createdAt", "updatedAt"],
            include: [
              {
                model: models.User,
                as: "user",
                attributes: ["id", "name", "email", "createdAt"],
              },
            ],
          },
        ],
      });

      return {
        success: true,
        data: updatedIssue,
        message: "Technician assigned successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Failed to assign technician",
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
          message: "Issue not found",
        };
      }

      // Verify maintenance executive exists
      const executive = await MaintenanceExecutive.findByPk(executiveId);
      if (!executive) {
        return {
          success: false,
          message: "Maintenance Executive not found",
        };
      }

      await issue.update({
        maintenance_executive_id: executiveId,
        maintenance_executive_assigned_at: new Date(),
      });

      // Fetch updated issue with executive info and assignment timestamp
      const updatedIssue = await Issue.findByPk(issueId, {
        attributes: [
          "id",
          "title",
          "description",
          "status",
          "maintenance_executive_id",
          "maintenance_executive_assigned_at",
          "updatedAt",
        ],
        include: [
          {
            model: MaintenanceExecutive,
            as: "maintenanceExecutive",
            attributes: ["id", "createdAt", "updatedAt"],
            include: [
              {
                model: models.User,
                as: "user",
                attributes: ["id", "name", "email", "createdAt"],
              },
            ],
          },
        ],
      });

      return {
        success: true,
        data: updatedIssue,
        message: "Maintenance Executive assigned successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Failed to assign maintenance executive",
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
          message: "Issue not found",
        };
      }

      // Verify third party exists
      const thirdParty = await ThirdParty.findByPk(thirdPartyId);
      if (!thirdParty) {
        return {
          success: false,
          message: "Third Party not found",
        };
      }

      await issue.update({
        third_party_id: thirdPartyId,
        third_party_assigned_at: new Date(),
      });

      // Fetch updated issue with third party info and assignment timestamp
      const updatedIssue = await Issue.findByPk(issueId, {
        attributes: [
          "id",
          "title",
          "description",
          "status",
          "third_party_id",
          "third_party_assigned_at",
          "updatedAt",
        ],
        include: [
          {
            model: ThirdParty,
            as: "thirdParty",
            attributes: [
              "id",
              "organization",
              "email",
              "worktype",
              "createdAt",
              "updatedAt",
            ],
          },
        ],
      });

      return {
        success: true,
        data: updatedIssue,
        message: "Third Party assigned successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Failed to assign third party",
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
          message: "Issue not found",
        };
      }

      await issue.update({ status });

      return {
        success: true,
        data: issue,
        message: "Issue status updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Failed to update issue status",
      };
    }
  }
}

export default new IssueService();
