import { getSequelizeInstance } from '../services/connectionService.js';
import Issue from './issue.js';
import User from './user.js';
import Branch from './branch.js';
import Message from './message.js';
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

// Branch associations
Branch.hasMany(BranchManager, {
  foreignKey: 'branchId',
  as: 'managers',
  onDelete: 'SET NULL'
});

BranchManager.belongsTo(Branch, {
  foreignKey: 'branchId',
  as: 'branch',
  onDelete: 'SET NULL'
});

// Message associations
User.hasMany(Message, {
  foreignKey: 'sender_id',
  as: 'sentMessages',
  onDelete: 'CASCADE'
});

User.hasMany(Message, {
  foreignKey: 'receiver_id',
  as: 'receivedMessages',
  onDelete: 'CASCADE'
});

Message.belongsTo(User, {
  foreignKey: 'sender_id',
  as: 'sender',
  onDelete: 'CASCADE'
});

Message.belongsTo(User, {
  foreignKey: 'receiver_id',
  as: 'receiver',
  onDelete: 'CASCADE'
});

// Issue associations
Issue.hasMany(Message, {
  foreignKey: 'issue_id',
  as: 'messages',
  onDelete: 'CASCADE'
});

Message.belongsTo(Issue, {
  foreignKey: 'issue_id',
  as: 'issue',
  onDelete: 'CASCADE'
});

// Initialize all models
const models = {
  Issue,
  User,
  Branch,
  Message,
  PettyCashRequest,
  Technician,
  BranchManager,
  MaintenanceExecutive,
  sequelize
};

// Export only the models object - cleaner and avoids redundancy
export default models;
