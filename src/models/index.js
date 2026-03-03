import { getSequelizeInstance } from '../services/connectionService.js';
import Issue from './issue.js';
import User from './user.js';
import Branch from './branch.js';
import Message from './message.js';
import PettyCashRequest from './pettyCashRequest.js';
import Technician from './technician.js';
import BranchManager from './branchManager.js';
import MaintenanceExecutive from './maintenanceExecutive.js';
import ThirdParty from './thirdParty.js';
import Status from './status.js';
import OutsidePartyRequest from './outsidePartyRequest.js';

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

// Message associations with User (sender and receiver)
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

// Issue associations with Branch, BranchManager, Technician, and MaintenanceExecutive
Branch.hasMany(Issue, {
  foreignKey: 'branch_id',
  as: 'issues',
  onDelete: 'CASCADE'
});

Issue.belongsTo(Branch, {
  foreignKey: 'branch_id',
  as: 'branch',
  onDelete: 'CASCADE'
});

BranchManager.hasMany(Issue, {
  foreignKey: 'manager_id',
  as: 'issues',
  onDelete: 'CASCADE'
});

Issue.belongsTo(BranchManager, {
  foreignKey: 'manager_id',
  as: 'manager',
  onDelete: 'CASCADE'
});

Technician.hasMany(Issue, {
  foreignKey: 'technician_id',
  as: 'assignedIssues',
  onDelete: 'SET NULL'
});

Issue.belongsTo(Technician, {
  foreignKey: 'technician_id',
  as: 'technician'
});

MaintenanceExecutive.hasMany(Issue, {
  foreignKey: 'maintenance_executive_id',
  as: 'assignedIssues',
  onDelete: 'SET NULL'
});

Issue.belongsTo(MaintenanceExecutive, {
  foreignKey: 'maintenance_executive_id',
  as: 'maintenanceExecutive'
});

// One-to-many relationship: Issue with PettyCashRequests
Issue.hasMany(PettyCashRequest, {
  foreignKey: 'issue_id',
  as: 'pettyCashRequests',
  onDelete: 'CASCADE'
});

PettyCashRequest.belongsTo(Issue, {
  foreignKey: 'issue_id',
  as: 'issue'
});

// Issue associations with Messages
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

// One-to-many relationship: ThirdParty with Issues
ThirdParty.hasMany(Issue, {
  foreignKey: 'third_party_id',
  as: 'issues',
  onDelete: 'SET NULL'
});

Issue.belongsTo(ThirdParty, {
  foreignKey: 'third_party_id',
  as: 'thirdParty'
});

// Issue <-> Status (status update log)
Issue.hasMany(Status, {
  foreignKey: 'issue_id',
  as: 'statuses',
  onDelete: 'CASCADE'
});

Status.belongsTo(Issue, {
  foreignKey: 'issue_id',
  as: 'issue',
  onDelete: 'CASCADE'
});

Status.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  onDelete: 'CASCADE'
});

User.hasMany(Status, {
  foreignKey: 'user_id',
  as: 'statusUpdates',
  onDelete: 'CASCADE'
});

// One-to-many relationship: Technician with PettyCashRequests
Technician.hasMany(PettyCashRequest, {
  foreignKey: 'technician_id',
  as: 'pettyCashRequests',
  onDelete: 'CASCADE'
});

PettyCashRequest.belongsTo(Technician, {
  foreignKey: 'technician_id',
  as: 'technician'
});

// One-to-many relationship: Issue with OutsidePartyRequests
Issue.hasMany(OutsidePartyRequest, {
  foreignKey: 'issue_id',
  as: 'outsidePartyRequests',
  onDelete: 'CASCADE'
});

OutsidePartyRequest.belongsTo(Issue, {
  foreignKey: 'issue_id',
  as: 'issue'
});

User.hasMany(OutsidePartyRequest, {
  foreignKey: 'suggested_by',
  as: 'outsidePartySuggestions',
  onDelete: 'CASCADE'
});

OutsidePartyRequest.belongsTo(User, {
  foreignKey: 'suggested_by',
  as: 'suggester'
});

// Initialize all models
const models = {
  Issue,
  User,
  Branch,
  Message,
  PettyCashRequest,
  OutsidePartyRequest,
  Technician,
  BranchManager,
  MaintenanceExecutive,
  ThirdParty,
  Status,
  sequelize
};


export default models;
