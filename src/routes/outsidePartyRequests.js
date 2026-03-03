import express from 'express';
import * as ctrl from '../controllers/outsidePartyRequestController.js';

const router = express.Router();

// GET /api/v1/outside-party-requests
router.get('/', ctrl.getAll);

// GET /api/v1/outside-party-requests/:id
router.get('/:id', ctrl.getOne);

// POST /api/v1/outside-party-requests
router.post('/', ctrl.create);

// PATCH /api/v1/outside-party-requests/:id/approve
router.patch('/:id/approve', ctrl.approve);

// PATCH /api/v1/outside-party-requests/:id/reject
router.patch('/:id/reject', ctrl.reject);

// DELETE /api/v1/outside-party-requests/:id
router.delete('/:id', ctrl.remove);

export default router;
