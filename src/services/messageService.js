import Message from "../models/message.js";

class MessageService {
  /**
   * Create a new message
   * @param {Object} messageData - Message data
   * @returns {Promise<Object>} Created message
   */
  async createMessage(messageData) {
    try {
      // Validate required fields
      if (!messageData.body || !messageData.sender_id || !messageData.receiver_id || !messageData.issue_id) {
        throw new Error("Missing required fields: body, sender_id, receiver_id, issue_id");
      }

      const message = await Message.create({
        body: messageData.body,
        sender_id: messageData.sender_id,
        receiver_id: messageData.receiver_id,
        issue_id: messageData.issue_id,
      });

      return message.toJSON();

    } catch (error) {
      // Handle known Sequelize errors
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new Error("Message already exists");
      } else if (error.name === "SequelizeValidationError") {
        throw new Error(error.errors.map((e) => e.message).join(", "));
      }

      throw error;
    }
  }

  /**
   * Get a single message by ID
   */
  async getMessagesById(id) {
    const messages = await Message.findAll({
      where: { id },
      order: [["createdAt", "DESC"]],
    });
    return messages;
  }

  /**
   * Get all messages by sender ID
   */
  async getMessagesBySenderId(senderId) {
    const messages = await Message.findAll({
      where: { sender_id: senderId },
      order: [["createdAt", "DESC"]],
    });
    return messages;
  }

  /**
   * Get all messages by Issue ID
   */
  async getMessagesByIssueId(issueId) {
    const messages = await Message.findAll({
      where: { issue_id: issueId },
      order: [["createdAt", "DESC"]],
    });
    return messages;
  }

  /**
   * Update a message by ID
   */
  async updateMessageById(id, messageData) {
    const [updated] = await Message.update(
      { body: messageData.body },
      { where: { id } }
    );

    if (!updated) {
      throw new Error("Message not found");
    }

    return await Message.findByPk(id);
  }

  /**
   * Delete a message by ID
   */
  async deleteMessageById(id) {
    const deletedCount = await Message.destroy({ where: { id } });
    if (!deletedCount) {
      throw new Error("Message not found");
    }

    return { message: "Message deleted successfully" };
  }
}

export default new MessageService();
