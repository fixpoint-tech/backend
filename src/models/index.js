import { getSequelizeInstance } from '../services/connectionService.js';
import Issue from './issue.js';

const sequelize = getSequelizeInstance();

// Initialize all models
const models = {
  Issue,
  sequelize
};

// Define associations here when you have multiple models
// For example:
// Issue.belongsTo(User, { foreignKey: 'userid' });
// Issue.belongsTo(Branch, { foreignKey: 'branch_id' });

export default models;
export { Issue, sequelize };