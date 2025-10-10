import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Branch = sequelize.define('Branch', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  location: { type: DataTypes.STRING(255) },
  address: { type: DataTypes.TEXT },
  phone: { type: DataTypes.STRING(20) },
  email: { type: DataTypes.STRING(255) },
  managerId: { type: DataTypes.INTEGER, field: 'manager_id' },
  coordinates: { type: DataTypes.JSONB },
  status: { type: DataTypes.STRING(50), defaultValue: 'active' }
}, {
  tableName: 'branches',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Branch;