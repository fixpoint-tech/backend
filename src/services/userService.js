import User from '../models/user.js';

/**
 * User Service - Contains all business logic for user operations
 * Handles CRUD operations for technicians, branch managers, and maintenance executives
 */
class UserService {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    try {
      const user = await User.create(userData);
      // Don't return password in response
      const userResponse = user.toJSON();
      delete userResponse.password;
      return userResponse;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  /**
   * Get all users, optionally filtered by role
   * @param {string} role - Optional role filter
   * @returns {Promise<Array>} List of users
   */
  async getAllUsers(role = null) {
    const where = { isActive: true };
    if (role) {
      where.role = role;
    }

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    return users;
  }

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User object
   */
  async getUserById(userId) {
    const user = await User.findOne({
      where: { id: userId, isActive: true },
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Update user by ID
   * @param {number} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(userId, updateData) {
    const user = await User.findOne({
      where: { id: userId, isActive: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Don't allow role or email updates through regular update
    delete updateData.role;
    delete updateData.email;
    delete updateData.isActive;

    await user.update(updateData);

    const updatedUser = user.toJSON();
    delete updatedUser.password;
    return updatedUser;
  }

  /**
   * Soft delete user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Success message
   */
  async deleteUser(userId) {
    const user = await User.findOne({
      where: { id: userId, isActive: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    await user.update({ isActive: false });

    return { message: 'User deleted successfully' };
  }

  /**
   * Get users by role
   * @param {string} role - User role
   * @returns {Promise<Array>} List of users
   */
  async getUsersByRole(role) {
    return this.getAllUsers(role);
  }
}

export default new UserService();
