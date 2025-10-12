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
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Branch identifier code'
    },
    branchName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Name of the branch managed'
    },
    region: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Geographic region (e.g., Western, Central, Southern)'
    },
    employeeId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      comment: 'Company employee ID'
    },
    managementLevel: {
      type: DataTypes.ENUM('junior', 'senior', 'regional'),
      allowNull: false,
      defaultValue: 'junior',
      comment: 'Management hierarchy level'
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
      },
      {
        fields: ['region']
      },
      {
        fields: ['managementLevel']
      }
    ]
  }
);

export default BranchManager;
