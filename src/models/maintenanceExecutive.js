import { DataTypes } from 'sequelize';
import { getSequelizeInstance } from '../services/connectionService.js';

const sequelize = getSequelizeInstance();

const MaintenanceExecutive = sequelize.define(
  'MaintenanceExecutive',
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
    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Department name (e.g., Operations, Facilities, Equipment)'
    },
    level: {
      type: DataTypes.ENUM('executive', 'senior_executive', 'chief'),
      allowNull: false,
      defaultValue: 'executive',
      comment: 'Executive hierarchy level'
    },
    employeeId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      comment: 'Company employee ID'
    },
    responsibilities: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Key areas of responsibility'
    },
    authorityLevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: {
          args: [1],
          msg: 'Authority level must be at least 1'
        },
        max: {
          args: [5],
          msg: 'Authority level cannot exceed 5'
        }
      },
      comment: 'Decision-making authority level (1-5)'
    }
  },
  {
    tableName: 'MaintenanceExecutives',
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
        fields: ['department']
      },
      {
        fields: ['level']
      },
      {
        fields: ['authorityLevel']
      }
    ]
  }
);

export default MaintenanceExecutive;
