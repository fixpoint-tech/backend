import { DataTypes } from 'sequelize';
import { getSequelizeInstance } from '../services/connectionService.js';
import User from './user.js'; 

const sequelize = getSequelizeInstance();

const Message = sequelize.define(
  'Message',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Message body is required'
        },
        notEmpty: {
          msg: 'Message body cannot be empty'
        }
      }
    },
    issue_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Issue ID is required'
        },
        notEmpty: {
          msg: 'Issue ID cannot be empty'
        }     
      }
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      validate: {
        notNull: {
          msg: 'Sender ID is required'
        },
        isInt: {
          msg: 'Sender ID must be an integer'
        }
      }
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      validate: {
        notNull: {
          msg: 'Receiver ID is required'
        },
        isInt: {
          msg: 'Receiver ID must be an integer'
        }
      }
    }
  },
  {
    tableName: 'Messages',
    timestamps: true,
    indexes: [
      {
        name: 'messages_sender_id_idx',
        fields: ['sender_id']
      },
      {
        name: 'messages_receiver_id_idx',
        fields: ['receiver_id']
      }
    ]
  }
);

// Associations (optional but recommended)
Message.associate = (models) => {
  Message.belongsTo(models.User, {
    as: 'Sender',
    foreignKey: 'sender_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  Message.belongsTo(models.User, {
    as: 'Receiver',
    foreignKey: 'receiver_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
};

export default Message;
