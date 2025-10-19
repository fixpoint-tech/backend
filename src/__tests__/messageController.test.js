import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock the services before importing the controller
const mockMessageService = {
  createMessage: jest.fn(),
  getMessagesById: jest.fn(),
  getMessagesBySenderId: jest.fn(),
  getMessagesByIssueId: jest.fn(),
  updateMessageById: jest.fn(),
  deleteMessageById: jest.fn()
};

const mockUserService = {
  getUserById: jest.fn()
};

// Mock the modules
jest.unstable_mockModule('../services/messageService.js', () => ({
  default: mockMessageService
}));

jest.unstable_mockModule('../services/userService.js', () => ({
  default: mockUserService
}));

// Import the controller after mocking
const { default: MessageController } = await import('../controllers/messageController.js');

const app = express();
app.use(express.json());

// Set up routes manually
app.post('/api/v1/messages', MessageController.createMessage);
app.get('/api/v1/messages/sender/:senderId', MessageController.getMessagesBySenderId);
app.get('/api/v1/messages/:id', MessageController.getMessageById);
app.get('/api/v1/messages/issue/:issueId', MessageController.getMessagesByIssueId);
app.put('/api/v1/messages/:id', MessageController.updateMessageById);
app.delete('/api/v1/messages/:id', MessageController.deleteMessageById);

describe('Message Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/messages', () => {
    it('should create a new message with valid data', async () => {
      const messageData = {
        body: 'This is a test message',
        sender_id: 1,
        receiver_id: 2,
        issue_id: 1
      };

      const mockCreatedMessage = {
        id: 1,
        ...messageData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockMessageService.createMessage.mockResolvedValue(mockCreatedMessage);

      const res = await request(app)
        .post('/api/v1/messages')
        .send(messageData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Message created successfully');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.body).toBe(messageData.body);
      expect(res.body.data.sender_id).toBe(messageData.sender_id);
      expect(res.body.data.receiver_id).toBe(messageData.receiver_id);
      expect(res.body.data.issue_id).toBe(messageData.issue_id);
      expect(mockMessageService.createMessage).toHaveBeenCalledWith(messageData);
    });

    it('should reject message with missing body', async () => {
      const messageData = {
        sender_id: 1,
        receiver_id: 2,
        issue_id: 1
      };

      mockMessageService.createMessage.mockRejectedValue(new Error('Missing required fields: body, sender_id, receiver_id, issue_id'));

      const res = await request(app)
        .post('/api/v1/messages')
        .send(messageData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Missing required fields');
    });

    it('should reject message with missing sender_id', async () => {
      const messageData = {
        body: 'Test message',
        receiver_id: 2,
        issue_id: 1
      };

      mockMessageService.createMessage.mockRejectedValue(new Error('Missing required fields: body, sender_id, receiver_id, issue_id'));

      const res = await request(app)
        .post('/api/v1/messages')
        .send(messageData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Missing required fields');
    });

    it('should reject message with missing receiver_id', async () => {
      const messageData = {
        body: 'Test message',
        sender_id: 1,
        issue_id: 1
      };

      mockMessageService.createMessage.mockRejectedValue(new Error('Missing required fields: body, sender_id, receiver_id, issue_id'));

      const res = await request(app)
        .post('/api/v1/messages')
        .send(messageData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Missing required fields');
    });

    it('should reject message with missing issue_id', async () => {
      const messageData = {
        body: 'Test message',
        sender_id: 1,
        receiver_id: 2
      };

      mockMessageService.createMessage.mockRejectedValue(new Error('Missing required fields: body, sender_id, receiver_id, issue_id'));

      const res = await request(app)
        .post('/api/v1/messages')
        .send(messageData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Missing required fields');
    });

    it('should reject message with empty body', async () => {
      const messageData = {
        body: '',
        sender_id: 1,
        receiver_id: 2,
        issue_id: 1
      };

      mockMessageService.createMessage.mockRejectedValue(new Error('Missing required fields: body, sender_id, receiver_id, issue_id'));

      const res = await request(app)
        .post('/api/v1/messages')
        .send(messageData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/messages/:id', () => {
    it('should get message by valid ID', async () => {
      const mockMessages = [
        { id: 1, body: 'Test message', sender_id: 1, receiver_id: 2, issue_id: 3 }
      ];
      
      mockMessageService.getMessagesById.mockResolvedValue(mockMessages);

      const res = await request(app)
        .get('/api/v1/messages/1');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('id', 1);
      expect(mockMessageService.getMessagesById).toHaveBeenCalledWith('1');
    });

    it('should return 404 for non-existent message ID', async () => {
      mockMessageService.getMessagesById.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/messages/99999');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Message not found');
    });

    it('should handle service errors', async () => {
      mockMessageService.getMessagesById.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/v1/messages/1');

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/messages/sender/:senderId', () => {
    it('should get all messages by sender ID', async () => {
      const mockMessages = [
        { id: 1, body: 'Message 1', sender_id: 1, receiver_id: 2, issue_id: 3 },
        { id: 2, body: 'Message 2', sender_id: 1, receiver_id: 3, issue_id: 4 }
      ];

      mockMessageService.getMessagesBySenderId.mockResolvedValue(mockMessages);

      const res = await request(app)
        .get('/api/v1/messages/sender/1');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.count).toBe(2);
      expect(res.body.data[0]).toHaveProperty('sender_id', 1);
      expect(mockMessageService.getMessagesBySenderId).toHaveBeenCalledWith('1');
    });

    it('should return empty array for sender with no messages', async () => {
      mockMessageService.getMessagesBySenderId.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/messages/sender/99999');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBe(0);
      expect(res.body.count).toBe(0);
    });
  });

  describe('GET /api/v1/messages/issue/:issueId', () => {
    it('should get all messages by issue ID', async () => {
      const mockMessages = [
        { id: 1, body: 'Issue message 1', sender_id: 1, receiver_id: 2, issue_id: 100 },
        { id: 2, body: 'Issue message 2', sender_id: 2, receiver_id: 1, issue_id: 100 }
      ];

      mockMessageService.getMessagesByIssueId.mockResolvedValue(mockMessages);

      const res = await request(app)
        .get('/api/v1/messages/issue/100');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.count).toBe(2);
      res.body.data.forEach(message => {
        expect(message).toHaveProperty('issue_id', 100);
      });
      expect(mockMessageService.getMessagesByIssueId).toHaveBeenCalledWith('100');
    });
  });

  describe('PUT /api/v1/messages/:id', () => {
    it('should update message with valid data', async () => {
      const updateData = {
        body: 'Updated message body'
      };
      
      const mockUpdatedMessage = {
        id: 1,
        body: 'Updated message body',
        sender_id: 1,
        receiver_id: 2,
        issue_id: 1
      };

      mockMessageService.updateMessageById.mockResolvedValue(mockUpdatedMessage);

      const res = await request(app)
        .put('/api/v1/messages/1')
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Message updated successfully');
      expect(res.body.data).toHaveProperty('body', updateData.body);
      expect(res.body.data).toHaveProperty('id', 1);
      expect(mockMessageService.updateMessageById).toHaveBeenCalledWith('1', updateData);
    });

    it('should return 404 for updating non-existent message', async () => {
      mockMessageService.updateMessageById.mockRejectedValue(new Error('Message not found'));

      const updateData = {
        body: 'Updated message body'
      };

      const res = await request(app)
        .put('/api/v1/messages/99999')
        .send(updateData);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Message not found');
    });
  });

  describe('DELETE /api/v1/messages/:id', () => {
    it('should delete message successfully', async () => {
      mockMessageService.deleteMessageById.mockResolvedValue({ message: 'Message deleted successfully' });

      const res = await request(app)
        .delete('/api/v1/messages/1');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Message deleted successfully');
      expect(mockMessageService.deleteMessageById).toHaveBeenCalledWith('1');
    });

    it('should return 404 for deleting non-existent message', async () => {
      mockMessageService.deleteMessageById.mockRejectedValue(new Error('Message not found'));

      const res = await request(app)
        .delete('/api/v1/messages/99999');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Message not found');
    });
  });
});