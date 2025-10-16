import messageService from "../services/messageService.js";
import userService from "../services/userService.js";

class MessageController {
    /**
     * Create a new message
     * POST /api/v1/messages
     */
    async createMessage(req, res) {
        // if (!req.user) return res.status(401).json({ success: false, message: "Login required" });
        // const user = await userService.getUserById(req.user.id);
        // if (!user) return res.status(401).json({ success: false, message: "User not found" });

        try {
            const messageData = req.body;
            const message = await messageService.createMessage(messageData);

            res.status(201).json({
                success: true,
                message: "Message created successfully",
                data: message,
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * Get message by ID
     * GET /api/v1/messages/:id
     */
    async getMessageById(req, res) {
        // if (!req.user) return res.status(401).json({ success: false, message: "Login required" });
        // const user = await userService.getUserById(req.user.id);
        // if (!user) return res.status(401).json({ success: false, message: "User not found" });

        try {
            const messages = await messageService.getMessagesById(req.params.id);

            if (!messages || messages.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Message not found",
                });
            }

            res.status(200).json({
                success: true,
                data: messages,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * Get all messages by sender ID
     * GET /api/v1/messages/sender/:senderId
     */
    async getMessagesBySenderId(req, res) {
        // if (!req.user) return res.status(401).json({ success: false, message: "Login required" });
        // const user = await userService.getUserById(req.user.id);
        // if (!user) return res.status(401).json({ success: false, message: "User not found" });

        try {
            const senderId = req.params.senderId;
            const messages = await messageService.getMessagesBySenderId(senderId);

            res.status(200).json({
                success: true,
                count: messages.length,
                data: messages,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * Get all messages by issue ID
     * GET /api/v1/messages/issue/:issueId
     */
    async getMessagesByIssueId(req, res) {
        // if (!req.user) return res.status(401).json({ success: false, message: "Login required" });
        // const user = await userService.getUserById(req.user.id);
        // if (!user) return res.status(401).json({ success: false, message: "User not found" });

        try {
            const issueId = req.params.issueId;
            const messages = await messageService.getMessagesByIssueId(issueId);

            res.status(200).json({
                success: true,
                count: messages.length,
                data: messages,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * Update message by ID
     * PUT /api/v1/messages/:id
     */
    async updateMessageById(req, res) {
        // if (!req.user) return res.status(401).json({ success: false, message: "Login required" });
        // const user = await userService.getUserById(req.user.id);
        // if (!user) return res.status(401).json({ success: false, message: "User not found" });

        try {
            const updatedMessage = await messageService.updateMessageById(
                req.params.id,
                req.body
            );

            res.status(200).json({
                success: true,
                message: "Message updated successfully",
                data: updatedMessage,
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * Delete message by ID
     * DELETE /api/v1/messages/:id
     */
    async deleteMessageById(req, res) {
        // if (!req.user) return res.status(401).json({ success: false, message: "Login required" });
        // const user = await userService.getUserById(req.user.id);
        // if (!user) return res.status(401).json({ success: false, message: "User not found" });

        try {
            const result = await messageService.deleteMessageById(req.params.id);

            res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message,
            });
        }
    }
}

export default new MessageController();
