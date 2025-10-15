import { getSequelizeInstance } from '../services/connectionService.js';
import Issue from './issue.js';
import User from './user.js';
import Branch from './branch.js';

const sequelize = getSequelizeInstance();

// Initialize all models
const models = {
  Issue,
  User,
  sequelize
};

// Define associations here when you have multiple models
// For example:
// Issue.belongsTo(User, { foreignKey: 'userid' });
// Issue.belongsTo(Branch, { foreignKey: 'branch_id' });
// Note: No relationships defined yet to avoid conflicts during development

export default models;
export { Issue, User, Branch, sequelize };