import { getSequelizeInstance } from '../services/connectionService.js';
import Issue from './issue.js';
import User from './user.js';
import PettyCashRequest from './pettyCashRequest.js';

const sequelize = getSequelizeInstance();

// Initialize all models
const models = {
  Issue,
  User,
  PettyCashRequest,
  sequelize
};

// Define associations here when you have multiple models
// For example:
// Issue.belongsTo(User, { foreignKey: 'userid' });
// PettyCashRequest.belongsTo(User, { foreignKey: 'technician_id' });
// Note: No relationships defined yet to avoid conflicts during development

export default models;
export { Issue, User, PettyCashRequest, sequelize };