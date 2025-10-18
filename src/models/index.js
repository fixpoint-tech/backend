import { getSequelizeInstance } from '../services/connectionService.js';
import Issue from './issue.js';
import User from './user.js';
import Branch from './branch.js';
import PettyCashRequest from './pettyCashRequest.js';
import Technician from './technician.js';
import BranchManager from './branchManager.js';
import MaintenanceExecutive from './maintenanceExecutive.js';

const sequelize = getSequelizeInstance();

// Define associations between User and role-specific tables
// One User can have one role-specific record
User.hasOne(Technician, {
  foreignKey: 'userId',
  as: 'technicianProfile',
  onDelete: 'CASCADE'
});

User.hasOne(BranchManager, {
  foreignKey: 'userId',
  as: 'branchManagerProfile',
  onDelete: 'CASCADE'
});

User.hasOne(MaintenanceExecutive, {
  foreignKey: 'userId',
  as: 'maintenanceExecutiveProfile',
  onDelete: 'CASCADE'
});

// Inverse relationships - each role belongs to one User
Technician.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE'
});

BranchManager.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE'
});

MaintenanceExecutive.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE'
});

// Initialize all models
const models = {
  Issue,
  User,
  PettyCashRequest,
  Technician,
  BranchManager,
  MaintenanceExecutive,
  sequelize
};

// Define associations here when you have multiple models
// For example:
// Issue.belongsTo(User, { foreignKey: 'userid' });
// PettyCashRequest.belongsTo(User, { foreignKey: 'technician_id' });
// Note: No relationships defined yet to avoid conflicts during development
// Export a single default and named exports for convenience
export default models;
export {
  Issue,
  User,
  PettyCashRequest,
  Technician,
  BranchManager, 
  Branch,
  MaintenanceExecutive,
  sequelize
};
