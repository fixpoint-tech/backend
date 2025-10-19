import { DataTypes } from 'sequelize';
import { getSequelizeInstance } from '../services/connectionService.js';

const sequelize = getSequelizeInstance();

const ThirdParty = sequelize.define(
    'ThirdParty',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        organization: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Organization name is required'
                },
                notEmpty: {
                    msg: 'Organization name cannot be empty'
                },
                len: {
                    args: [2, 255],
                    msg: 'Organization name must be between 2 and 255 characters'
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
        location: {
            type: DataTypes.STRING(255),
            allowNull: true,
            validate: {
                len: {
                    args: [0, 255],
                    msg: 'Location must be less than 255 characters'
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
        worktype: {
            type: DataTypes.STRING(100),
            allowNull: true,
            validate: {
                len: {
                    args: [0, 100],
                    msg: 'Work type must be less than 100 characters'
                }
            }
        },
        profilePicture: {
            type: DataTypes.STRING(500),
            allowNull: true,
            comment: 'URL to profile picture in MinIO storage'
        }
    },
    {
        tableName: 'ThirdParties',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['email']
            },
            {
                fields: ['organization']
            },
            {
                fields: ['worktype']
            }
        ]
    }
);

export default ThirdParty;