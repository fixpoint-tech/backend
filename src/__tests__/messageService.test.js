import { jest } from '@jest/globals';

// Create a mock Message class
const mockMessage = {
  create: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  findByPk: jest.fn(),
  destroy: jest.fn()
};

// Mock the Message model before importing the service
jest.unstable_mockModule('../models/message.js', () => ({
  default: mockMessage
}));

// Import messageService after mocking
const { default: messageService } = await import('../services/messageService.js');

describe('MessageService', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMessage', () => {
    const validMessageData = {
      body: 'Test message body',
      sender_id: 1,
      receiver_id: 2,
      issue_id: 3
    };

    it('should create a message with valid data', async () => {
      const mockCreatedMessage = {
        id: 1,
        ...validMessageData,
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON: jest.fn().mockReturnValue({ id: 1, ...validMessageData })
      };

      mockMessage.create.mockResolvedValue(mockCreatedMessage);

      const result = await messageService.createMessage(validMessageData);

      expect(mockMessage.create).toHaveBeenCalledWith({
        body: validMessageData.body,
        sender_id: validMessageData.sender_id,
        receiver_id: validMessageData.receiver_id,
        issue_id: validMessageData.issue_id,
      });
      expect(mockCreatedMessage.toJSON).toHaveBeenCalled();
      expect(result).toEqual({ id: 1, ...validMessageData });
    });

    it('should throw error when required fields are missing', async () => {
      const invalidData = { body: 'Test message' }; // Missing other required fields

      await expect(messageService.createMessage(invalidData))
        .rejects.toThrow('Missing required fields: body, sender_id, receiver_id, issue_id');
      
      expect(mockMessage.create).not.toHaveBeenCalled();
    });

    it('should handle SequelizeUniqueConstraintError', async () => {
      const sequelizeError = new Error('Unique constraint error');
      sequelizeError.name = 'SequelizeUniqueConstraintError';
      
      mockMessage.create.mockRejectedValue(sequelizeError);

      await expect(messageService.createMessage(validMessageData))
        .rejects.toThrow('Message already exists');
    });

    it('should handle SequelizeValidationError', async () => {
      const sequelizeError = new Error('Validation error');
      sequelizeError.name = 'SequelizeValidationError';
      sequelizeError.errors = [
        { message: 'Body is required' },
        { message: 'Sender ID must be an integer' }
      ];
      
      mockMessage.create.mockRejectedValue(sequelizeError);

      await expect(messageService.createMessage(validMessageData))
        .rejects.toThrow('Body is required, Sender ID must be an integer');
    });
  });

  describe('getMessagesById', () => {
    it('should return messages by ID', async () => {
      const mockMessages = [
        { id: 1, body: 'Message 1', sender_id: 1, receiver_id: 2, issue_id: 3 }
      ];

      mockMessage.findAll.mockResolvedValue(mockMessages);

      const result = await messageService.getMessagesById(1);

      expect(mockMessage.findAll).toHaveBeenCalledWith({
        where: { id: 1 },
        order: [["createdAt", "DESC"]],
      });
      expect(result).toEqual(mockMessages);
    });

    it('should return empty array when no messages found', async () => {
      mockMessage.findAll.mockResolvedValue([]);

      const result = await messageService.getMessagesById(999);

      expect(result).toEqual([]);
    });
  });

  describe('getMessagesBySenderId', () => {
    it('should return messages by sender ID', async () => {
      const mockMessages = [
        { id: 1, body: 'Message 1', sender_id: 1, receiver_id: 2, issue_id: 3 }
      ];

      mockMessage.findAll.mockResolvedValue(mockMessages);

      const result = await messageService.getMessagesBySenderId(1);

      expect(mockMessage.findAll).toHaveBeenCalledWith({
        where: { sender_id: 1 },
        order: [["createdAt", "DESC"]],
      });
      expect(result).toEqual(mockMessages);
    });
  });

  describe('getMessagesByIssueId', () => {
    it('should return messages by issue ID', async () => {
      const mockMessages = [
        { id: 1, body: 'Message 1', sender_id: 1, receiver_id: 2, issue_id: 3 }
      ];

      mockMessage.findAll.mockResolvedValue(mockMessages);

      const result = await messageService.getMessagesByIssueId(3);

      expect(mockMessage.findAll).toHaveBeenCalledWith({
        where: { issue_id: 3 },
        order: [["createdAt", "DESC"]],
      });
      expect(result).toEqual(mockMessages);
    });
  });

  describe('updateMessageById', () => {
    it('should update message successfully', async () => {
      const updateData = { body: 'Updated message body' };
      const mockUpdatedMessage = {
        id: 1,
        body: 'Updated message body',
        sender_id: 1,
        receiver_id: 2,
        issue_id: 3
      };

      mockMessage.update.mockResolvedValue([1]); // Number of affected rows
      mockMessage.findByPk.mockResolvedValue(mockUpdatedMessage);

      const result = await messageService.updateMessageById(1, updateData);

      expect(mockMessage.update).toHaveBeenCalledWith(
        { body: updateData.body },
        { where: { id: 1 } }
      );
      expect(mockMessage.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUpdatedMessage);
    });

    it('should throw error when message not found for update', async () => {
      mockMessage.update.mockResolvedValue([0]); // No rows affected
      const updateData = { body: 'Updated message body' };

      await expect(messageService.updateMessageById(999, updateData))
        .rejects.toThrow('Message not found');
      
      expect(mockMessage.findByPk).not.toHaveBeenCalled();
    });
  });

  describe('deleteMessageById', () => {
    it('should delete message successfully', async () => {
      mockMessage.destroy.mockResolvedValue(1); // Number of deleted rows

      const result = await messageService.deleteMessageById(1);

      expect(mockMessage.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({ message: "Message deleted successfully" });
    });

    it('should throw error when message not found for deletion', async () => {
      mockMessage.destroy.mockResolvedValue(0); // No rows deleted

      await expect(messageService.deleteMessageById(999))
        .rejects.toThrow('Message not found');
    });
  });
});