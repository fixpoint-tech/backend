import { DataTypes } from 'sequelize';
import { getSequelizeInstance } from '../services/connectionService.js';

const sequelize = getSequelizeInstance();

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Name is required'
        },
        notEmpty: {
          msg: 'Name cannot be empty'
        },
        len: {
          args: [2, 255],
          msg: 'Name must be between 2 and 255 characters'
        }
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notNull: {
          msg: 'Email is required'
        },
        isEmail: {
          msg: 'Must be a valid email address'
        }
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Optional field for future authentication'
    },
    role: {
      type: DataTypes.ENUM('technician', 'branch_manager', 'maintenance_executive'),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Role is required'
        },
        isIn: {
          args: [['technician', 'branch_manager', 'maintenance_executive']],
          msg: 'Role must be technician, branch_manager, or maintenance_executive'
        }
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: {
          args: [10, 20],
          msg: 'Phone number must be between 10 and 20 characters'
        }
      }
    },
    profilePicture: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL to profile picture in MinIO storage'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    tableName: 'Users',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['role']
      }
    ]
  }
);

// Define associations
// Note: The actual association setup happens in src/models/index.js
// to avoid circular dependency issues

export default User;
