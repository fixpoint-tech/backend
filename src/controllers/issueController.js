import issueService from '../services/issueService.js';
import { notifyNewIssue, notifyAssign, makeDynamicNamespace, issueRealtimeUpdate, removeDynamicNamespace } from '../socket/socket.js';

class IssueController {
  // POST /api/issues - Create new issue
  async createIssue(req, res) {
    try {
      const { 
        branch_id, 
        title, 
        manager_id, 
        description, 
        maintenance_executive_id, 
        technician_id, 
        status,
        third_party_id 
      } = req.body;

      // Validation
      if (!branch_id || !title || !manager_id) {
        return res.status(400).json({
          success: false,
          message: 'Branch ID, title, and manager ID are required'
        });
      }

      const issueData = {
        branch_id: parseInt(branch_id),
        title,
        manager_id: parseInt(manager_id),
        description
      };

      // Add optional fields if provided
      if (maintenance_executive_id) {
        issueData.maintenance_executive_id = parseInt(maintenance_executive_id);
      }
      if (technician_id) {
        issueData.technician_id = parseInt(technician_id);
      }
      if (status) {
        issueData.status = status;
      }
      if (third_party_id) {
        issueData.third_party_id = parseInt(third_party_id);
      }

      const result = await issueService.createIssue(issueData);

      if (result.success) {
        // Notify all Maintenance Executives about the new issue(real-time)
        try { notifyNewIssue(result); } catch (e) { console.error(e);}

        try {
          // Create dynamic namespaces for real-time communication
          makeDynamicNamespace(result.data.id);
        } catch (nsErr) {
          console.error('makeDynamicNamespace failed:', nsErr);
        }

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
      const { 
        branch_id, 
        manager_id, 
        technician_id, 
        maintenance_executive_id,
        third_party_id,
        status,
        search, 
        limit, 
        offset,
        include_relations 
      } = req.query;

      const filters = {};
      if (branch_id) filters.branch_id = parseInt(branch_id);
      if (manager_id) filters.manager_id = parseInt(manager_id);
      if (technician_id) filters.technician_id = parseInt(technician_id);
      if (maintenance_executive_id) filters.maintenance_executive_id = parseInt(maintenance_executive_id);
      if (third_party_id) filters.third_party_id = parseInt(third_party_id);
      if (status) filters.status = status;
      if (search) filters.search = search;
      if (limit) filters.limit = parseInt(limit);
      if (offset) filters.offset = parseInt(offset);
      if (include_relations) filters.include_relations = include_relations === 'true';

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

  // GET /api/issues/:id - Get issue by ID
  async getIssueById(req, res) {
    try {
      const { id } = req.params;
      const { include_relations } = req.query;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid issue ID is required'
        });
      }

      const result = await issueService.getIssueById(parseInt(id), include_relations === 'true');

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(404).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // PUT /api/issues/:id - Update issue
  async updateIssue(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid issue ID is required'
        });
      }

      // Convert string IDs to integers if provided
      ['branch_id', 'manager_id', 'technician_id', 'maintenance_executive_id', 'third_party_id'].forEach(field => {
        if (updateData[field]) {
          updateData[field] = parseInt(updateData[field]);
        }
      });

      const result = await issueService.updateIssue(parseInt(id), updateData);

      try {
        // Notify via realtime update that the issue has been updated
        issueRealtimeUpdate(result.data.id, result);
      } catch (err) {
        console.error('issueRealtimeUpdate error after updating issue:', err);
      }


      if (result.success) {
        return res.status(200).json(result);
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

  // DELETE /api/issues/:id - Delete issue
  async deleteIssue(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid issue ID is required'
        });
      }

      const result = await issueService.deleteIssue(parseInt(id));

      if (result.success) {
        // Remove all connections and delete the namespace for the issue
        removeDynamicNamespace(parseInt(id));
        return res.status(200).json(result);
      } else {
        return res.status(404).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // POST /api/issues/:id/assign-technician - Assign technician to issue
  async assignTechnician(req, res) {
    try {
      const { id } = req.params;
      const { technician_id } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid issue ID is required'
        });
      }

      if (!technician_id) {
        return res.status(400).json({
          success: false,
          message: 'Technician ID is required'
        });
      }

      const result = await issueService.assignTechnician(parseInt(id), parseInt(technician_id));

      if (result.success) {
        // Notify via realtime update that the technician has been assigned
        try {
          issueRealtimeUpdate(parseInt(id), result);
        } catch (emitErr) {
          console.error('issueRealtimeUpdate failed:', emitErr);
        }

        // broadcast assignment to the assigned technician (real-time)
        try {
          notifyAssign(parseInt(technician_id), result);
        } catch (emitErr) {
          console.error('notifyAssign failed:', emitErr);
        }

        return res.status(200).json(result);
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

  // POST /api/issues/:id/assign-maintenance-executive - Assign maintenance executive to issue
  async assignMaintenanceExecutive(req, res) {
    try {
      const { id } = req.params;
      const { maintenance_executive_id } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid issue ID is required'
        });
      }

      if (!maintenance_executive_id) {
        return res.status(400).json({
          success: false,
          message: 'Maintenance Executive ID is required'
        });
      }

      const result = await issueService.assignMaintenanceExecutive(parseInt(id), parseInt(maintenance_executive_id));

      if (result.success) {
        // Notify via realtime update that the maintenance executive has been assigned
        try {
          issueRealtimeUpdate(parseInt(id), result);
        } catch (emitErr) {
          console.error('issueRealtimeUpdate failed:', emitErr);
        }

        // Notify all Maintenance Executives about the new issue(real-time) update with assigned ME
        try { notifyNewIssue(result); } catch (e) { console.error(e);}

        return res.status(200).json(result);
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

  // POST /api/issues/:id/assign-third-party - Assign third party to issue
  async assignThirdParty(req, res) {
    try {
      const { id } = req.params;
      const { third_party_id } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid issue ID is required'
        });
      }

      if (!third_party_id) {
        return res.status(400).json({
          success: false,
          message: 'Third Party ID is required'
        });
      }

      const result = await issueService.assignThirdParty(parseInt(id), parseInt(third_party_id));

      if (result.success) {
        // Notify via realtime update that the third party has been assigned
        try {
          issueRealtimeUpdate(parseInt(id), result);
        } catch (emitErr) {
          console.error('issueRealtimeUpdate failed:', emitErr);
        }

        return res.status(200).json(result);
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

  // PUT /api/issues/:id/status - Update issue status
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid issue ID is required'
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const validStatuses = ['Open', 'In Progress', 'Done', 'Closed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${validStatuses.join(', ')}`
        });
      }

      const result = await issueService.updateStatus(parseInt(id), status);

      if (result.success) {
        // Notify via realtime update that the issue status has been updated
        try {
          issueRealtimeUpdate(parseInt(id), result);
        } catch (emitErr) {
          console.error('issueRealtimeUpdate failed:', emitErr);
        }

        // Notify all users about the issue status update(real-time)
        try { notifyNewIssue(result); } catch (e) { console.error(e);}

        // Remove all connections and delete the namespace for the issue
        if (result.data.status === 'Closed' || result.data.status === 'Done') {
          removeDynamicNamespace(result.data.id);
        }

        return res.status(200).json(result);
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
}
export default new IssueController();
