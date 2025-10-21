import models from '../models/index.js';

const { User, Technician, BranchManager, MaintenanceExecutive } = models;
import { getSequelizeInstance } from './connectionService.js';

const sequelize = getSequelizeInstance();

/**
 * User Service - Contains all business logic for user operations
 * Handles CRUD operations for technicians, branch managers, and maintenance executives
 * Now with support for role-specific profile tables and relationships
 */
class UserService {
  /**
   * Create a new user with role-specific profile
   * @param {Object} userData - User data (basic info)
   * @param {Object} profileData - Role-specific profile data
   * @returns {Promise<Object>} Created user with profile
   */
  async createUser(userData, profileData = {}) {
    const transaction = await sequelize.transaction();
    
    try {
      // Create base user
      const user = await User.create(userData, { transaction });
      
      // Create role-specific profile based on user role
      let profile = null;
      if (userData.role === 'technician') {
        profile = await Technician.create({
          userId: user.id,
          ...profileData
        }, { transaction });
      } else if (userData.role === 'branch_manager') {
        profile = await BranchManager.create({
          userId: user.id,
          ...profileData
        }, { transaction });
      } else if (userData.role === 'maintenance_executive') {
        profile = await MaintenanceExecutive.create({
          userId: user.id,
          ...profileData
        }, { transaction });
      }

      await transaction.commit();

      // Fetch complete user with profile (outside transaction)
      const completeUser = await User.findOne({
        where: { id: user.id },
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Technician,
            as: 'technicianProfile',
            required: false
          },
          {
            model: BranchManager,
            as: 'branchManagerProfile',
            required: false
          },
          {
            model: MaintenanceExecutive,
            as: 'maintenanceExecutiveProfile',
            required: false
          }
        ]
      });

      return completeUser;
    } catch (error) {
      // Only rollback if transaction hasn't been committed
      if (!transaction.finished) {
        await transaction.rollback();
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Email or employee ID already exists');
      }
      throw error;
    }
  }

  /**
   * Get all users with their profiles, optionally filtered by role
   * @param {string} role - Optional role filter
   * @returns {Promise<Array>} List of users with profiles
   */
  async getAllUsers(role = null) {
    const where = { isActive: true };
    if (role) {
      where.role = role;
    }

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Technician,
          as: 'technicianProfile',
          required: false
        },
        {
          model: BranchManager,
          as: 'branchManagerProfile',
          required: false
        },
        {
          model: MaintenanceExecutive,
          as: 'maintenanceExecutiveProfile',
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return users;
  }

  /**
   * Get user by ID with profile
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User object with profile
   */
  async getUserById(userId) {
    const user = await User.findOne({
      where: { id: userId, isActive: true },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Technician,
          as: 'technicianProfile',
          required: false
        },
        {
          model: BranchManager,
          as: 'branchManagerProfile',
          required: false
        },
        {
          model: MaintenanceExecutive,
          as: 'maintenanceExecutiveProfile',
          required: false
        }
      ]
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Update user and/or profile by ID
   * @param {number} userId - User ID
   * @param {Object} updateData - Data to update (user fields)
   * @param {Object} profileData - Profile data to update (role-specific fields)
   * @returns {Promise<Object>} Updated user with profile
   */
  async updateUser(userId, updateData, profileData = {}) {
    const transaction = await sequelize.transaction();
    
    try {
      const user = await User.findOne({
        where: { id: userId, isActive: true },
        transaction
      });

      if (!user) {
        await transaction.rollback();
        throw new Error('User not found');
      }

      // Don't allow role or email updates through regular update
      delete updateData.role;
      delete updateData.email;
      delete updateData.isActive;

      // Update base user if there's data
      if (Object.keys(updateData).length > 0) {
        await user.update(updateData, { transaction });
      }

      // Update role-specific profile if provided
      if (Object.keys(profileData).length > 0) {
        if (user.role === 'technician') {
          await Technician.update(profileData, {
            where: { userId: user.id },
            transaction
          });
        } else if (user.role === 'branch_manager') {
          await BranchManager.update(profileData, {
            where: { userId: user.id },
            transaction
          });
        } else if (user.role === 'maintenance_executive') {
          await MaintenanceExecutive.update(profileData, {
            where: { userId: user.id },
            transaction
          });
        }
      }

      await transaction.commit();

      // Fetch updated user with profile
      return await this.getUserById(userId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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
   * Get users by role with profiles
   * @param {string} role - User role
   * @returns {Promise<Array>} List of users with profiles
   */
  async getUsersByRole(role) {
    return this.getAllUsers(role);
  }
}

export default new UserService();
