import sequelize from '../config/sequelize.js';
import User from './User.js';
import Branch from './Branch.js';

User.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });
Branch.hasMany(User, { foreignKey: 'branchId', as: 'users' });

export { sequelize, User, Branch };