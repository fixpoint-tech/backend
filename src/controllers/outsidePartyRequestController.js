import * as OutsidePartyRequestService from '../services/outsidePartyRequestService.js';
import { issueRealtimeUpdate } from '../socket/socket.js';

/** GET /api/v1/outside-party-requests */
export const getAll = async (req, res) => {
    try {
        const filters = {};
        if (req.query.issue_id) filters.issue_id = req.query.issue_id;
        if (req.query.status) filters.status = req.query.status;
        if (req.query.suggested_by) filters.suggested_by = req.query.suggested_by;
        const data = await OutsidePartyRequestService.getAll(filters);
        res.json({ success: true, count: data.length, data });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

/** GET /api/v1/outside-party-requests/:id */
export const getOne = async (req, res) => {
    try {
        const data = await OutsidePartyRequestService.getById(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

/** POST /api/v1/outside-party-requests */
export const create = async (req, res) => {
    try {
        const data = await OutsidePartyRequestService.create(req.body);
        try { issueRealtimeUpdate(data.issue_id, data); } catch (_) { }
        res.status(201).json({ success: true, data });
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};

/** PATCH /api/v1/outside-party-requests/:id/approve */
export const approve = async (req, res) => {
    try {
        const approverId = req.body.approved_by || req.body.user_id;
        const comment = req.body.comment || null;

        // Role check — only branch_manager / maintenance_executive
        const userRole = req.body.user_role;
        if (userRole && !['branch_manager', 'maintenance_executive'].includes(userRole)) {
            return res.status(403).json({ success: false, message: 'Permission denied' });
        }

        const data = await OutsidePartyRequestService.approve(req.params.id, approverId, comment);
        if (!data) return res.status(404).json({ success: false, message: 'Not found' });
        try { issueRealtimeUpdate(data.issue_id, { ...data, event_type: 'outside_party_approved' }); } catch (_) { }
        res.json({ success: true, data });
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};

/** PATCH /api/v1/outside-party-requests/:id/reject */
export const reject = async (req, res) => {
    try {
        const approverId = req.body.approved_by || req.body.user_id;
        const comment = req.body.comment || null;

        const userRole = req.body.user_role;
        if (userRole && !['branch_manager', 'maintenance_executive'].includes(userRole)) {
            return res.status(403).json({ success: false, message: 'Permission denied' });
        }

        const data = await OutsidePartyRequestService.reject(req.params.id, approverId, comment);
        if (!data) return res.status(404).json({ success: false, message: 'Not found' });
        try { issueRealtimeUpdate(data.issue_id, { ...data, event_type: 'outside_party_rejected' }); } catch (_) { }
        res.json({ success: true, data });
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};

/** DELETE /api/v1/outside-party-requests/:id */
export const remove = async (req, res) => {
    try {
        const deleted = await OutsidePartyRequestService.remove(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, message: 'Deleted' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
