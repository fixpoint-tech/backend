import models from '../models/index.js';
import branchService from './branchService.js';

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
   * Get user by email (for authentication)
   * @param {string} email - User email
   * @returns {Promise<Object>} User object with password included
   */
  async getUserByEmail(email) {
    const user = await User.findOne({
      where: { email, isActive: true },
      // Include password for authentication
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

      // Don't allow role or isActive updates through regular update
      delete updateData.role;
      // delete updateData.email;  <-- REMOVED this line so email can be updated
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

  // /**
  //  * Get users by role with profiles
  //  * @param {string} role - User role
  //  * @returns {Promise<Array>} List of users with profiles
  //  */
  // async getUsersByRole(role) {
  //   return this.getAllUsers(role);
  // }

  /**
   * Get users by role with ONLY their specific profile
   * If branch_manager, manually attaches branch data using BranchService
   * @param {string} role - User role
   * @returns {Promise<Array>} List of users
   */
  async getUsersByRole(role) {
    const include = [];

    if (role === 'technician') {
      include.push({ model: Technician, as: 'technicianProfile' });
    } else if (role === 'branch_manager') {
      include.push({ model: BranchManager, as: 'branchManagerProfile' });
    } else if (role === 'maintenance_executive') {
      include.push({ model: MaintenanceExecutive, as: 'maintenanceExecutiveProfile' });
    }

    const users = await User.findAll({
      where: { role, isActive: true },
      attributes: { exclude: ['password'] },
      include,
      order: [['createdAt', 'DESC']]
    });

    // If role is branch_manager, iterate and fetch branch details manually
    if (role === 'branch_manager') {
      const usersWithBranch = await Promise.all(users.map(async (user) => {
        const userJson = user.toJSON();
        const branchId = userJson.branchManagerProfile?.branchId;

        if (branchId) {
          const branchResult = await branchService.getBranchById(branchId);
          if (branchResult.success) {
            userJson.Branch = branchResult.data; // Attaching branch data
          }
        }
        return userJson;
      }));
      return usersWithBranch;
    }

    return users;
  }
}

export default new UserService();
