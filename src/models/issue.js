import { DataTypes } from 'sequelize';
import { getSequelizeInstance } from '../services/connectionService.js';

const sequelize = getSequelizeInstance();

const Issue = sequelize.define('Issue', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Branches',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    validate: {
      notNull: {
        msg: 'Branch ID is required'
      },
      isInt: {
        msg: 'Branch ID must be an integer'
      }
    }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notNull: {
        msg: 'Title is required'
      },
      notEmpty: {
        msg: 'Title cannot be empty'
      },
      len: {
        args: [3, 255],
        msg: 'Title must be between 3 and 255 characters'
      }
    }
  },
  manager_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'BranchManagers',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    validate: {
      notNull: {
        msg: 'manager ID is required'
      },
      isInt: {
        msg: 'manager ID must be an integer'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 5000],
        msg: 'Description cannot exceed 5000 characters'
      }
    }
  },
  maintenance_executive_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'MaintenanceExecutives',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    validate: {
      isInt: {
        msg: 'Maintenance Executive ID must be an integer'
      }
    }
  },
  technician_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Technicians',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    validate: {
      isInt: {
        msg: 'Technician ID must be an integer'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('Open', 'In Progress', 'Pending Resolution', 'Pending Close', 'Done', 'Closed'),
    allowNull: false,
    defaultValue: 'Open',
    validate: {
      isIn: {
        args: [['Open', 'In Progress', 'Pending Resolution', 'Pending Close', 'Done', 'Closed']],
        msg: 'Status must be one of: Open, In Progress, Pending Resolution, Pending Close, Done, Closed'
      }
    }
  },
  third_party_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'ThirdParties',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    validate: {
      isInt: {
        msg: 'Third Party ID must be an integer'
      }
    }
  },
  technician_assigned_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  maintenance_executive_assigned_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  third_party_assigned_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
},
  {
    tableName: 'Issues',
    timestamps: true, // This will automatically add createdAt and updatedAt
    indexes: [
      {
        fields: ['branch_id']
      },
      {
        fields: ['manager_id']
      },
      {
        fields: ['maintenance_executive_id']
      },
      {
        fields: ['technician_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['third_party_id']
      }
    ]
  });

export default Issue;