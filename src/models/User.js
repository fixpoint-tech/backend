import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userName: { type: DataTypes.STRING(100), allowNull: false, unique: true, field: 'user_name' },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  fullName: { type: DataTypes.STRING(255), allowNull: false, field: 'full_name' },
  role: { type: DataTypes.ENUM('technician', 'branch_manager', 'maintenance_executive', 'admin'), allowNull: false },
  phone: { type: DataTypes.STRING(20) },
  branchId: { type: DataTypes.INTEGER, field: 'branch_id' },
  profilePicture: { type: DataTypes.STRING(500), field: 'profile_picture' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
  lastLogin: { type: DataTypes.DATE, field: 'last_login' }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default User;