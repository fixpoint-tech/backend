import { Router } from 'express';
import MessageController from '../controllers/messageController.js';

const router = Router();

// POST /api/messages - Create new message
router.post('/', MessageController.createMessage);

// GET /api/messages/sender/:senderId - Get all messages by sender ID
router.get('/sender/:senderId', MessageController.getMessagesBySenderId);

// GET /api/messages/:id - Get message by ID
router.get('/:id', MessageController.getMessageById);

// GET /api/messages/issue/:issueId - Get all messages by issue ID
router.get('/issue/:issueId', MessageController.getMessagesByIssueId);

// PUT /api/messages/:id - Update message by ID
router.put('/:id', MessageController.updateMessageById);

// DELETE /api/messages/:id - Delete message by ID
router.delete('/:id', MessageController.deleteMessageById);

export default router;
