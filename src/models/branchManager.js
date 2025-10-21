import { DataTypes } from 'sequelize';
import { getSequelizeInstance } from '../services/connectionService.js';

const sequelize = getSequelizeInstance();

const BranchManager = sequelize.define(
  'BranchManager',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      validate: {
        notNull: {
          msg: 'User ID is required'
        }
      }
    },
    branchId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'branches',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Branch identifier - references Branch table'
    },
    employeeId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      comment: 'Company employee ID'
    }
  },
  {
    tableName: 'BranchManagers',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId']
      },
      {
        unique: true,
        fields: ['employeeId']
      },
      {
        fields: ['branchId']
      }
    ],
    // Remove userId from JSON responses to avoid duplication
    defaultScope: {
      attributes: { exclude: ['userId'] }
    }
  }
);

export default BranchManager;
