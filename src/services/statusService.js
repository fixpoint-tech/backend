import Status from '../models/status.js';
import User from '../models/user.js';
import Issue from '../models/issue.js';

class StatusService {
    /**
     * Create a new status update record for an issue.
     * @param {object} data - { issue_id, user_id, description, image_url, image_urls, status_type }
     */
    async createStatusUpdate(data) {
        try {
            const { issue_id, user_id, description, image_url, image_urls, status_type } = data;

            // Validate issue exists
            const issue = await Issue.findByPk(issue_id);
            if (!issue) {
                return { success: false, message: 'Issue not found' };
            }

            // Validate user exists
            const user = await User.findByPk(user_id);
            if (!user) {
                return { success: false, message: 'User not found' };
            }

            // Handle both single image_url and multiple image_urls
            let imageValue = null;
            if (image_urls && Array.isArray(image_urls) && image_urls.length > 0) {
                imageValue = image_urls;
            } else if (image_url) {
                imageValue = image_url;
            }

            const statusUpdate = await Status.create({
                issue_id,
                user_id,
                description,
                image_url: imageValue,
                status_type: status_type || 'Open'
            });

            // Fetch with user relation for the response
            const result = await Status.findByPk(statusUpdate.id, {
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email', 'profilePicture']
                    }
                ]
            });

            return {
                success: true,
                message: 'Status update created successfully',
                data: result
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

    /**
     * Get all status updates for a given issue.
     * @param {number} issue_id
     */
    async getStatusUpdatesByIssue(issue_id) {
        try {
            const statusUpdates = await Status.findAll({
                where: { issue_id },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email', 'profilePicture']
                    }
                ],
                order: [['createdAt', 'ASC']]
            });

            return {
                success: true,
                message: 'Status updates retrieved successfully',
                data: statusUpdates,
                count: statusUpdates.length
            };
        } catch (error) {
            console.error('Error fetching status updates:', error);
            return {
                success: false,
                message: 'Failed to fetch status updates',
                error: error.message
            };
        }
    }
}

export default new StatusService();
