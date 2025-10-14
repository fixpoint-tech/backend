import { DataTypes } from 'sequelize';
import { getSequelizeInstance } from '../services/connectionService.js';

const sequelize = getSequelizeInstance();

const Technician = sequelize.define(
  'Technician',
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
    specialization: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Technical specialization area (e.g., Electrical, Mechanical, Software)'
    },
    experienceYears: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Experience years cannot be negative'
        }
      }
    },
    employeeId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      comment: 'Company employee ID'
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Availability status for task assignment'
    },
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Location/area the technician covers'
    }
  },
  {
    tableName: 'Technicians',
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
        fields: ['specialization']
      },
      {
        fields: ['isAvailable']
      },
      {
        fields: ['locationId']
      }
    ],
    // Remove userId from JSON responses to avoid duplication
    defaultScope: {
      attributes: { exclude: ['userId'] }
    }
  }
);

export default Technician;
