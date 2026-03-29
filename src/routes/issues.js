import { Router } from "express";
import issueController from "../controllers/issueController.js";
import { authorizeRoles } from "../middleware/auth.js";
import statusController from '../controllers/statusController.js';

const router = Router();

// POST /api/v1/issues - Create new issue
router.post(
  "/",
  authorizeRoles("maintenance_executive", "branch_manager"),
  issueController.createIssue,
);

// GET /api/v1/issues - Get all issues with filtering
router.get("/", issueController.getAllIssues);

// GET /api/v1/issues/:id - Get issue by ID
router.get("/:id", issueController.getIssueById);

// PUT /api/v1/issues/:id - Update issue
router.put("/:id", issueController.updateIssue);

// DELETE /api/v1/issues/:id - Delete issue
router.delete("/:id", issueController.deleteIssue);

// POST /api/v1/issues/:id/assign-technician - Assign technician to issue
router.post("/:id/assign-technician", issueController.assignTechnician);

// POST /api/v1/issues/:id/assign-maintenance-executive - Assign maintenance executive to issue
router.post(
  "/:id/assign-maintenance-executive",
  issueController.assignMaintenanceExecutive,
);

// POST /api/v1/issues/:id/assign-third-party - Assign third party to issue
router.post("/:id/assign-third-party", issueController.assignThirdParty);

// PUT /api/v1/issues/:id/status - Update issue status
router.put("/:id/status", issueController.updateStatus);

// GET /api/v1/issues/:id/statuses - Get all status update logs for an issue
router.get('/:id/statuses', statusController.getStatusUpdates);

// POST /api/v1/issues/:id/statuses - Add a status update log entry
router.post('/:id/statuses', statusController.createStatusUpdate);

export default router;
