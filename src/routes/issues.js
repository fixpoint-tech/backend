import { Router } from 'express';
import issueController from '../controllers/issueController.js';

const router = Router();

// POST /api/issues - Create new issue
router.post('/', issueController.createIssue);

// GET /api/issues - Get all issues (with optional filters)
router.get('/', issueController.getAllIssues);

export default router;