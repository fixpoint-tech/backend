import { DataTypes } from 'sequelize';
import { getSequelizeInstance } from '../services/connectionService.js';

const sequelize = getSequelizeInstance();

const OutsidePartyRequest = sequelize.define(
    'OutsidePartyRequest',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        issue_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Issues', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        suggested_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Users', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        vendor_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: { msg: 'Vendor name is required' },
                notEmpty: { msg: 'Vendor name cannot be empty' }
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
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            allowNull: false,
            defaultValue: 'pending',
            validate: {
                isIn: {
                    args: [['pending', 'approved', 'rejected']],
                    msg: 'Status must be pending, approved, or rejected'
                }
            }
        },
        approved_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        approval_comment: {
            type: DataTypes.TEXT,
            allowNull: true
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
        tableName: 'outside_party_requests',
        timestamps: true,
        underscored: true,
        indexes: [
            { name: 'idx_outside_party_requests_issue_id', fields: ['issue_id'] },
            { name: 'idx_outside_party_requests_suggested_by', fields: ['suggested_by'] },
            { name: 'idx_outside_party_requests_status', fields: ['status'] }
        ]
    }
);

/**
 * Get all outside party requests with optional filtering
 */
OutsidePartyRequest.getAllWithFilters = async function (filters = {}) {
    const where = {};
    if (filters.issue_id) where.issue_id = filters.issue_id;
    if (filters.status) where.status = filters.status;
    if (filters.suggested_by) where.suggested_by = filters.suggested_by;
    return await this.findAll({ where, order: [['created_at', 'DESC']] });
};

/**
 * Update request status
 */
OutsidePartyRequest.updateStatus = async function (id, status, approvedBy = null, comment = null) {
    const record = await this.findByPk(id);
    if (!record) return null;
    record.status = status;
    if (approvedBy) record.approved_by = approvedBy;
    if (comment !== null) record.approval_comment = comment;
    await record.save();
    return record;
};

export default OutsidePartyRequest;
