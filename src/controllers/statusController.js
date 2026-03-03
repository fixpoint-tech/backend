import statusService from '../services/statusService.js';
import { statusUpdateLogCreated } from '../socket/socket.js';

class StatusController {
    /**
     * POST /api/v1/issues/:id/statuses
     * Create a status update log for an issue.
     */
    async createStatusUpdate(req, res) {
        try {
            const { id } = req.params;
            const { user_id, description, image_url, image_urls, status_type } = req.body;

            if (!id || isNaN(id)) {
                return res.status(400).json({ success: false, message: 'Valid issue ID is required' });
            }
            if (!user_id) {
                return res.status(400).json({ success: false, message: 'User ID is required' });
            }
            if (!description || description.trim() === '') {
                return res.status(400).json({ success: false, message: 'Description is required' });
            }

            // Validate image_urls if provided
            if (image_urls && !Array.isArray(image_urls)) {
                return res.status(400).json({ success: false, message: 'image_urls must be an array' });
            }

            const validTypes = ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
            if (status_type && !validTypes.includes(status_type)) {
                return res.status(400).json({
                    success: false,
                    message: `status_type must be one of: ${validTypes.join(', ')}`
                });
            }

            const result = await statusService.createStatusUpdate({
                issue_id: parseInt(id),
                user_id: parseInt(user_id),
                description: description.trim(),
                image_url: image_url || null,
                image_urls: image_urls || null,
                status_type: status_type || 'Open'
            });

            if (result.success) {
                // Emit socket event for real-time status log update
                try {
                    statusUpdateLogCreated(parseInt(id), result.data);
                } catch (socketErr) {
                    console.error('Socket emit failed for status update:', socketErr);
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

    /**
     * GET /api/v1/issues/:id/statuses
     * Get all status updates for an issue.
     */
    async getStatusUpdates(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({ success: false, message: 'Valid issue ID is required' });
            }

            const result = await statusService.getStatusUpdatesByIssue(parseInt(id));

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
}

export default new StatusController();
