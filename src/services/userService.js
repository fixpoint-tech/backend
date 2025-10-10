import { User, Branch } from '../models/index.js';
import { Op } from 'sequelize';

export const createUser = async (userData) => {
  return await User.create(userData);
};

export const getAllUsers = async (filters = {}) => {
  const { page = 1, limit = 10, role, branchId, isActive } = filters;
  const where = {};
  if (role) where.role = role;
  if (branchId) where.branchId = branchId;
  if (isActive !== undefined) where.isActive = isActive;

  const { count, rows } = await User.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: (page - 1) * limit,
    include: [{ model: Branch, as: 'branch' }],
    order: [['createdAt', 'DESC']]
  });

  return { users: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) };
};

export const getUserById = async (id) => {
  return await User.findByPk(id, { include: [{ model: Branch, as: 'branch' }] });
};

export const updateUser = async (id, updateData) => {
  const user = await User.findByPk(id);
  if (!user) return null;
  return await user.update(updateData);
};

export const deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) return null;
  return await user.update({ isActive: false });
};

export const updateUserProfile = async (id, profileData) => {
  const user = await User.findByPk(id);
  if (!user) return null;
  return await user.update(profileData);
};

export const getUsersByRole = async (role, filters = {}) => {
  const { isActive = true } = filters;
  return await User.findAll({
    where: { role, isActive },
    include: [{ model: Branch, as: 'branch' }]
  });
};

export const getUsersByBranch = async (branchId, filters = {}) => {
  const { role, isActive = true } = filters;
  const where = { branchId, isActive };
  if (role) where.role = role;
  return await User.findAll({ where });
};

export const checkEmailExists = async (email, excludeUserId = null) => {
  const where = { email: email.toLowerCase() };
  if (excludeUserId) where.id = { [Op.ne]: excludeUserId };
  return !!(await User.findOne({ where }));
};

export const checkUsernameExists = async (userName, excludeUserId = null) => {
  const where = { userName };
  if (excludeUserId) where.id = { [Op.ne]: excludeUserId };
  return !!(await User.findOne({ where }));
};

export const getUserStats = async () => {
  const total = await User.count({ where: { isActive: true } });
  const technicians = await User.count({ where: { role: 'technician', isActive: true } });
  const managers = await User.count({ where: { role: 'branch_manager', isActive: true } });
  const executives = await User.count({ where: { role: 'maintenance_executive', isActive: true } });
  return { total, byRole: { technicians, managers, executives } };
};