import { DataTypes } from 'sequelize';
import { getSequelizeInstance } from '../services/connectionService.js';

const sequelize = getSequelizeInstance();

const PettyCashRequest = sequelize.define(
    'PettyCashRequest',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        technician_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Technician ID is required'
                },
                isInt: {
                    msg: 'Technician ID must be an integer'
                }
            },
            comment: 'Foreign key reference to the technician who submitted the request'
        },
        ticket_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Ticket ID is required'
                },
                isInt: {
                    msg: 'Ticket ID must be an integer'
                }
            },
            comment: 'Foreign key reference to the maintenance ticket'
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Amount is required'
                },
                isDecimal: {
                    msg: 'Amount must be a valid decimal number'
                },
                min: {
                    args: [0.01],
                    msg: 'Amount must be greater than 0'
                }
            },
            comment: 'Requested cash amount (max 10 digits, 2 decimal places)'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Description is required'
                },
                notEmpty: {
                    msg: 'Description cannot be empty'
                },
                len: {
                    args: [10, 5000],
                    msg: 'Description must be between 10 and 5000 characters'
                }
            },
            comment: 'Detailed description of what the cash will be used for'
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            allowNull: false,
            defaultValue: 'pending',
            validate: {
                notNull: {
                    msg: 'Status is required'
                },
                isIn: {
                    args: [['pending', 'approved', 'rejected']],
                    msg: 'Status must be pending, approved, or rejected'
                }
            },
            comment: 'Current status: pending, approved, or rejected'
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'updated_at'
        }
    },
    {
        tableName: 'petty_cash_requests',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                name: 'idx_petty_cash_requests_technician_id',
                fields: ['technician_id']
            },
            {
                name: 'idx_petty_cash_requests_ticket_id',
                fields: ['ticket_id']
            },
            {
                name: 'idx_petty_cash_requests_status',
                fields: ['status']
            },
            {
                name: 'idx_petty_cash_requests_created_at',
                fields: ['created_at']
            }
        ]
    }
);

/**
 * Get all petty cash requests with optional filtering
 * @param {Object} filters - Optional filters (technician_id, status, ticket_id)
 * @returns {Promise<Array>} Array of cash requests
 */
PettyCashRequest.getAllWithFilters = async function (filters = {}) {
    const whereClause = {};

    if (filters.technician_id) {
        whereClause.technician_id = filters.technician_id;
    }

    if (filters.status) {
        whereClause.status = filters.status;
    }

    if (filters.ticket_id) {
        whereClause.ticket_id = filters.ticket_id;
    }

    return await this.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']]
    });
};

/**
 * Get cash requests statistics for a technician
 * @param {string} technician_id - Technician UUID
 * @returns {Promise<Object>} Statistics object
 */
PettyCashRequest.getStatsByTechnician = async function (technician_id) {
    const [results] = await sequelize.query(`
    SELECT 
      COUNT(*) as total_requests,
      COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
      COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
      COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
      COALESCE(SUM(amount) FILTER (WHERE status = 'approved'), 0) as total_approved_amount,
      COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0) as total_pending_amount
    FROM petty_cash_requests
    WHERE technician_id = :technician_id
  `, {
        replacements: { technician_id },
        type: sequelize.QueryTypes.SELECT
    });

    return results[0] || {
        total_requests: 0,
        pending_count: 0,
        approved_count: 0,
        rejected_count: 0,
        total_approved_amount: 0,
        total_pending_amount: 0
    };
};

/**
 * Update the status of a cash request
 * @param {string} id - Cash request UUID
 * @param {string} status - New status (pending, approved, rejected)
 * @returns {Promise<Object|null>} Updated cash request or null if not found
 */
PettyCashRequest.updateStatus = async function (id, status) {
    const cashRequest = await this.findByPk(id);

    if (!cashRequest) {
        return null;
    }

    cashRequest.status = status;
    await cashRequest.save();

    return cashRequest;
};

export default PettyCashRequest;
