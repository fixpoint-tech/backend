import { DataTypes } from 'sequelize';
import { getSequelizeInstance } from '../services/connectionService.js';

const sequelize = getSequelizeInstance();

const Status = sequelize.define('Status', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    issue_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Issues',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        validate: {
            notNull: { msg: 'Issue ID is required' },
            isInt: { msg: 'Issue ID must be an integer' }
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('image_url');
            if (!rawValue) return null;
            
            // Try to parse as JSON array
            try {
                const parsed = JSON.parse(rawValue);
                return Array.isArray(parsed) ? parsed : [rawValue];
            } catch {
                // If not JSON, treat as single URL
                return [rawValue];
            }
        },
        set(value) {
            if (!value) {
                this.setDataValue('image_url', null);
            } else if (Array.isArray(value)) {
                // Store array as JSON string
                this.setDataValue('image_url', JSON.stringify(value));
            } else {
                // Store single value as-is
                this.setDataValue('image_url', value);
            }
        }
    },
    status_type: {
        type: DataTypes.ENUM('Open', 'Assigned', 'In Progress', 'Pending Resolution', 'Pending Close', 'Resolved', 'Closed'),
        allowNull: false,
        defaultValue: 'Open',
        validate: {
            isIn: {
                args: [['Open', 'Assigned', 'In Progress', 'Pending Resolution', 'Pending Close', 'Resolved', 'Closed']],
                msg: 'Status type must be one of: Open, Assigned, In Progress, Pending Resolution, Pending Close, Resolved, Closed'
            }
        }
    }
}, {
    tableName: 'Statuses',
    timestamps: true,
    indexes: [
        { fields: ['issue_id'], name: 'idx_status_issue_id' },
        { fields: ['user_id'], name: 'idx_status_user_id' }
    ]
});

export default Status;
