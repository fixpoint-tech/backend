import { DataTypes } from 'sequelize';
import { getSequelizeInstance } from '../services/connectionService.js';

const sequelize = getSequelizeInstance();

const Status = sequelize.define(
  'Status',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },

    issue_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'Issue ID is required' },
        isInt: { msg: 'Issue ID must be an integer' }
      }
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'User ID is required' },
        isInt: { msg: 'User ID must be an integer' }
      }
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: { msg: 'Description is required' },
        notEmpty: { msg: 'Description cannot be empty' }
      }
    },

    image_url: {
      type: DataTypes.STRING,
      allowNull: true
    },

    status_type: {
      type: DataTypes.ENUM('Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'),
      allowNull: false,
      defaultValue: 'Open',
      validate: {
        isIn: {
          args: [['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed']],
          msg: 'Status type must be one of: Open, Assigned, In Progress, Resolved, Closed'
        }
      }
    }
  },
  {
    tableName: 'Statuses',
    timestamps: true,
    indexes: [
      { fields: ['issue_id'] },
      { fields: ['user_id'] },
      { fields: ['createdAt'] }
    ]
  }
);

export default Status;